package main

import (
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {

	asciiHeight := len(strings.Split(asciiArt, "\n"))
	var docStyle = lipgloss.NewStyle().Margin(asciiHeight/2, 2)

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
	case resultState:
		return updateResult(msg, m)
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
			case "Check URL":
				m.state = inputState
				m.textInput.SetValue("")
				m.textInput.Focus()
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

func updateInput(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyEnter:
			if m.textInput.Value() != "" {
				m.url = m.textInput.Value()
				m.textInput.Blur()
				m.state = resultState
				return m, checkServer(m.url)
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

func updateResult(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case statusMsg:
		m.status = int(msg)
		return m, nil
	case errMsg:
		m.err = msg
		return m, nil
	case tea.KeyMsg:
		if msg.Type == tea.KeyCtrlC || msg.Type == tea.KeyEsc {
			m.state = menuState
			m.err = nil
			m.status = 0
			return m, nil
		}
	}
	return m, nil
}
