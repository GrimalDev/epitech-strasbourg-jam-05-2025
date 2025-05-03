package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

const asciiArt = `
  _____
 /     \
|  O O  |
|   ^   |
|  '-'  |
 \_____/
Welcome to the Dashboard!
`

type state int

const (
	menuState state = iota
	inputState
	resultState
)

type item struct {
	title, desc string
}

func (i item) Title() string       { return i.title }
func (i item) Description() string { return i.desc }
func (i item) FilterValue() string { return i.title }

type statusMsg int
type errMsg error

type model struct {
	state     state
	menu      list.Model
	textInput textinput.Model
	status    int
	err       error
	url       string
}

var docStyle = lipgloss.NewStyle().Margin(1, 2)

func initialModel() model {
	items := []list.Item{
		item{title: "Check URL", desc: "Enter a URL to check its status"},
		item{title: "Exit", desc: "Quit the program"},
	}

	m := list.New(items, list.NewDefaultDelegate(), 0, 0)
	m.Title = "Main Menu"
	m.SetHeight(1)

	ti := textinput.New()
	ti.Placeholder = "https://example.com"
	ti.CharLimit = 256
	ti.Width = 50

	return model{
		state:     menuState,
		menu:      m,
		textInput: ti,
		err:       nil,
		url:       "",
	}
}

func (m model) Init() tea.Cmd {
	switch m.state {
	case menuState:
		return nil
	case inputState:
		return textinput.Blink
	default:
		return nil
	}
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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

func (m model) View() string {
	switch m.state {
	case menuState:
		return fmt.Sprintf("%s\n\n%s", asciiArt, m.menu.View())
	case inputState:
		return fmt.Sprintf("Enter a URL to check:\n\n%s\n\n(enter to submit, esc to go back)", m.textInput.View())
	case resultState:
		s := fmt.Sprintf("Checking %s...\n", m.url)
		if m.err != nil {
			s += fmt.Sprintf("Error: %s", m.err)
		} else if m.status != 0 {
			s += fmt.Sprintf("Status: %d %s", m.status, http.StatusText(m.status))
		}
		s += "\n\n(esc to go back)"
		return s
	}
	return ""
}

func checkServer(url string) tea.Cmd {
	return func() tea.Msg {
		resp, err := http.Get(url)
		if err != nil {
			return errMsg(err)
		}
		defer resp.Body.Close()
		return statusMsg(resp.StatusCode)
	}
}

func main() {
	p := tea.NewProgram(initialModel())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
	}
}
