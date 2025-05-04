package main

import (
	"fmt"
	"net/http"

	"github.com/charmbracelet/lipgloss"
)

func (m model) View() string {
	switch m.state {
	case menuState:
		// Create a clear separation between ASCII art and menu
		// asciiHeight := len(strings.Split(asciiArt, "\n"))
		docStyle := lipgloss.NewStyle().Margin(1, 2)
		// return fmt.Sprintf("\n%s\n%s", asciiArt, m.menu.View())
		return docStyle.Render(asciiArt + m.menu.View())
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
