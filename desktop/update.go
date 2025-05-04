package main

import (
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// descriptionMsg is used to deliver markdown content to the app
type descriptionMsg string

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {

	asciiHeight := len(strings.Split(asciiArt, "\n"))
	var docStyle = lipgloss.NewStyle().Margin((asciiHeight/2)+1, 2)

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		h, v := docStyle.GetFrameSize()
		m.menu.SetSize(msg.Width-h, msg.Height-v)
	}

	switch m.state {
	case menuState:
		return updateMenu(msg, m)
	case inputState:
		return updateInput(msg, m)
	case cacheState:
		return updateInputFlag(msg, m)
	case loginState:
		return updateLogin(msg, m)
	case resultState:
		return updateResult(msg, m)
	case markdownState:
		return updateMarkdown(msg, m)
	}
	return m, nil
}

func updateMenu(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "enter":
			selectedItem := m.menu.SelectedItem().(item)
			switch selectedItem.title {

			case "Find spots":
				m.state = inputState
				m.textInput.SetValue("")
				m.textInput.Focus()
				return m, textinput.Blink

			case "Check flag":
				m.state = cacheState
				for i := range m.flagInputs {
					m.flagInputs[i].SetValue("")
				}
				m.flagInputs[0].Focus()
				m.flagInputFocus = 0
				return m, textinput.Blink

			case "Login":
				m.state = loginState
				for i := range m.loginInputs {
					m.loginInputs[i].SetValue("")
				}
				m.loginInputs[0].Focus()
				m.loginInputFocus = 0
				return m, textinput.Blink

			case "Exit":
				return m, tea.Quit
			}
		}
	}

	var cmd tea.Cmd
	m.menu, cmd = m.menu.Update(msg)
	return m, cmd
}

func updateLogin(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case authResponseMsg:
		// Store the authentication info
		m.accessToken = msg.AccessToken
		m.tokenType = msg.TokenType
		m.expiresIn = msg.ExpiresIn
		m.refreshToken = msg.RefreshToken
		m.userInfo = string(msg.User)
		m.isLoggedIn = true

		// Save credentials to file
		err := saveAuthResponse(m.credentialsFile, m.email, m.password, msg)
		if err != nil {
			return m, func() tea.Msg { return errMsg(err) }
		}

		// Store token in global variable for use in requests
		currentToken = msg.AccessToken

		// Return to menu
		m.state = menuState
		return m, nil

	case errMsg:
		// Authentication error
		m.err = msg
		return m, nil

	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyEnter:
			// Submit login
			if m.loginInputs[0].Value() != "" && m.loginInputs[1].Value() != "" {
				m.email = m.loginInputs[0].Value()
				m.password = m.loginInputs[1].Value()

				// Authenticate with Supabase
				return m, authenticate(m.email, m.password)
			}
		case tea.KeyTab, tea.KeyShiftTab, tea.KeyDown, tea.KeyUp:
			// Toggle between inputs
			if msg.Type == tea.KeyTab || msg.Type == tea.KeyDown {
				m.loginInputFocus = (m.loginInputFocus + 1) % len(m.loginInputs)
			} else {
				m.loginInputFocus = (m.loginInputFocus - 1 + len(m.loginInputs)) % len(m.loginInputs)
			}

			for i := range m.loginInputs {
				if i == m.loginInputFocus {
					m.loginInputs[i].Focus()
				} else {
					m.loginInputs[i].Blur()
				}
			}
			return m, nil
		case tea.KeyCtrlC, tea.KeyEsc:
			m.state = menuState
			for i := range m.loginInputs {
				m.loginInputs[i].Blur()
			}
			return m, nil
		}
	}

	// Update the active input
	var cmd tea.Cmd
	m.loginInputs[m.loginInputFocus], cmd = m.loginInputs[m.loginInputFocus].Update(msg)
	return m, cmd
}

func updateInput(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyEnter:
			if m.textInput.Value() != "" {
				m.spot_id = m.textInput.Value()
				m.textInput.Blur()
				m.state = markdownState
				return m, checkServer(m, m.spot_id)
			}
		case tea.KeyCtrlC, tea.KeyEsc:
			m.state = menuState
			return m, nil
		}
	}

	var cmd tea.Cmd
	m.textInput, cmd = m.textInput.Update(msg)
	return m, cmd
}

func updateInputFlag(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyEnter:
			if m.flagInputs[0].Value() != "" && m.flagInputs[1].Value() != "" {
				m.spot_id = m.flagInputs[0].Value()
				m.flag = m.flagInputs[1].Value()
				m.state = resultState
				return m, checkFlag(m.spot_id, m.flag)
			}
		case tea.KeyTab, tea.KeyShiftTab, tea.KeyDown, tea.KeyUp:
			// Toggle between inputs
			if msg.Type == tea.KeyTab || msg.Type == tea.KeyDown {
				m.flagInputFocus = (m.flagInputFocus + 1) % len(m.flagInputs)
			} else {
				m.flagInputFocus = (m.flagInputFocus - 1 + len(m.flagInputs)) % len(m.flagInputs)
			}

			for i := range m.flagInputs {
				if i == m.flagInputFocus {
					m.flagInputs[i].Focus()
				} else {
					m.flagInputs[i].Blur()
				}
			}
			return m, nil
		case tea.KeyCtrlC, tea.KeyEsc:
			m.state = menuState
			for i := range m.flagInputs {
				m.flagInputs[i].Blur()
			}
			return m, nil
		}
	}

	var cmd tea.Cmd
	m.flagInputs[m.flagInputFocus], cmd = m.flagInputs[m.flagInputFocus].Update(msg)
	return m, cmd
}

func updateResult(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case statusMsg:
		m.status = int(msg)
		return m, nil
	case responseBodyMsg:
		m.responseBody = string(msg)
		return m, nil
	case errMsg:
		m.err = msg
		return m, nil
	case tea.KeyMsg:
		if msg.Type == tea.KeyCtrlC || msg.Type == tea.KeyEsc {
			m.state = menuState
			m.err = nil
			m.status = 0
			m.responseBody = ""
			return m, nil
		}
	}
	return m, nil
}

func updateMarkdown(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			m.state = menuState
			for i := range m.loginInputs {
				m.loginInputs[i].Blur()
			}
			return m, nil
		}
	case descriptionMsg:
		// If we receive a description message, update the description
		m.description = string(msg)
		return m, nil
	}
	return m, nil
}
