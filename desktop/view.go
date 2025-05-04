package main

import (
	"fmt"
	"strconv"

	"github.com/charmbracelet/glamour"
	"github.com/charmbracelet/lipgloss"
)

func (m model) View() string {
	// Add a login status indicator
	docStyle := lipgloss.NewStyle().Margin(0, 2)

	// Create a style for the login status
	loginStatusStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#4CAF50")). // Green color
		Bold(true)

	loginStatus := ""
	if m.isLoggedIn {
		loginStatus = fmt.Sprintf("\nLogged in as: %s", m.email)
		loginStatus = loginStatusStyle.Render(loginStatus)
	}

	switch m.state {

	case menuState:
		return docStyle.Render(asciiArt + loginStatus + "\n" + m.menu.View())

	case inputState:
		return fmt.Sprintf(
			"%s\n\nEnter the first part of the SSID of the spot:\n\n%s\n\n(esc to cancel)",
			loginStatus,
			m.textInput.View(),
		)

	case cacheState:
		return fmt.Sprintf(
			"%s\n\nEnter a spot id and a flag to check:\n\n%s\n%s\n\n(esc to cancel)",
			loginStatus,
			m.flagInputs[0].View(),
			m.flagInputs[1].View(),
		)

	case loginState:
		return fmt.Sprintf(
			"Login to your account:\n\n%s\n%s\n\n(tab to switch, enter to submit, esc to cancel)",
			m.loginInputs[0].View(),
			m.loginInputs[1].View(),
		)

	case resultState:
		if m.err != nil {
			return fmt.Sprintf("Error: %v\n\nPress any key to go back%s", m.err, loginStatus)
		}
		return fmt.Sprintf(
			"%s \nSpot id: %s\nStatus: %s\n%s\nPress any key to go back",
			loginStatus,
			m.spot_id,
			strconv.Itoa(m.status),
			m.responseBody,
		)

	case markdownState:
		// Create styles for markdown rendering

		titleStyle := lipgloss.NewStyle().
			Foreground(lipgloss.Color("#7D56F4")).
			Bold(true).
			Padding(0, 1).
			MarginBottom(1)

		// // Create a border style for the entire content
		// borderStyle := lipgloss.NewStyle().
		// 	Border(lipgloss.RoundedBorder()).
		// 	BorderForeground(lipgloss.Color("#375A7F")).
		// 	Padding(1, 2).
		// 	MarginTop(1)

		// Parse and render the markdown
		renderedMarkdown, err := glamour.Render(m.description, "dark")
		if err != nil {
			renderedMarkdown = fmt.Sprintf("Error rendering markdown: %v", err)
		}

		return docStyle.Render(loginStatus + "\n\n" + titleStyle.Render("Description") + "\n" + renderedMarkdown + "\n\nPress Esc key to go back")
	}
	return ""
}
