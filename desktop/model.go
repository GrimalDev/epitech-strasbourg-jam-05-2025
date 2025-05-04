package main

import (
	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	// "github.com/charmbracelet/lipgloss"
)

const asciiArt = `
	                                                                            ,-.                    .'\ _                                                    
 _________  ________  ________  ___      ___ _______   ___                  ,'   \                 .'   (_)
|\___   ___\\   __  \|\   __  \|\  \    /  /|\  ___ \ |\  \                J     '-._ /\         .'     (,_)
\|___ \  \_\ \  \|\  \ \  \|\  \ \  \  /  / | \   __/|\ \  \              /  _  /   ,'# )_       _\_     (_)
     \ \  \ \ \   _  _\ \   __  \ \  \/  / / \ \  \_|/_\ \  \            /  '_Y'   /_.,'  \     (  _')     \
      \ \  \ \ \  \\  \\ \  \ \  \ \    / /   \ \  \_|\ \ \  \____       | _ /   ,'\/  .   |    '.  __)     \
       \ \__\ \ \__\\ _\\ \__\ \__\ \__/ /     \ \_______\ \_______\     |'.Y   / # ) --'  /  _.-'  __)    .'
        \|__|  \|__|\|__|\|__|\|__|\|__|/       \|_______|\|_______|   _._\,'  ,'__,'      /  _\    / \   .'
 ________  ________  ________  _________                                 ,'-_ /           _.-' _\  /   \.'
|\   __  \|\   __  \|\   __  \|\___   ___\                              '    (_       _.-' _.-'  \/
\ \  \|\  \ \  \|\  \ \  \|\  \|___ \  \_|                                     \  _.-' _.-' '-.     ./
 \ \   _  _\ \  \\\  \ \  \\\  \   \ \  \                                       -'  .-'        '-.-'/
  \ \  \\  \\ \  \\\  \ \  \\\  \   \ \  \                                      |   \o     _.-'####/
   \ \__\\ _\\ \_______\ \_______\   \ \__\                                     |    \o_.-' \#####/
    \|__|\|__|\|_______|\|_______|    \|__|                                     |_.-#\       \###/
                                                                                ######\       \/'
                                                                                # #####\-.
`

type state int

const (
	menuState state = iota
	inputState
	resultState
	loginState
	markdownState
	cacheState
)

type model struct {
	state           state
	menu            list.Model
	textInput       textinput.Model
	description     string
	status          int
	err             error
	spot_id         string
	flag            string
	responseBody    string
	flagInputs      []textinput.Model
	loginInputs     []textinput.Model
	loginInputFocus int
	flagInputFocus  int
	email           string
	password        string
	isLoggedIn      bool
	accessToken     string
	tokenType       string
	expiresIn       int
	refreshToken    string
	userInfo        string
	credentialsFile string
	markdownTitle   string
	markdownHeading string
	markdownContent string
	markdownCode    string
}

// ShowMarkdown switches to markdown view with the provided content
func (m model) ShowMarkdown(title, heading, content, code string) tea.Cmd {
	m.markdownTitle = title
	m.markdownHeading = heading
	m.markdownContent = content
	m.markdownCode = code
	m.state = markdownState
	return nil
}

// Global variable to store the current token
var currentToken string

// InitialModel creates and returns the initial application model
func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "Id"
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 50

	idInput := textinput.New()
	idInput.Placeholder = "Id"
	idInput.CharLimit = 100
	idInput.Width = 50

	flagInput := textinput.New()
	flagInput.Placeholder = "flag"
	flagInput.CharLimit = 100
	flagInput.Width = 50

	// Create login inputs
	emailInput := textinput.New()
	emailInput.Placeholder = "Email"
	emailInput.CharLimit = 100
	emailInput.Width = 50

	passwordInput := textinput.New()
	passwordInput.Placeholder = "Password"
	passwordInput.EchoMode = textinput.EchoPassword
	passwordInput.CharLimit = 100
	passwordInput.Width = 50

	items := []list.Item{
		item{title: "Find spots", desc: "Get instruction on spots"},
		item{title: "Check flag", desc: "Verify a flag"}, item{title: "Login", desc: "Login to your account"},
		item{title: "Exit", desc: "Exit the program"},
	}

	menu := list.New(items, list.NewDefaultDelegate(), 0, 0)
	menu.SetShowTitle(false)
	// menu.Title = "Hacking Spot Scanner"

	m := model{
		state:           menuState,
		menu:            menu,
		textInput:       ti,
		flagInputs:      []textinput.Model{idInput, flagInput},
		loginInputs:     []textinput.Model{emailInput, passwordInput},
		loginInputFocus: 0,
		flagInputFocus:  0,
		credentialsFile: "credentials.json",
		isLoggedIn:      false,
	}

	// Try to load existing credentials
	creds, err := loadCredentials(m.credentialsFile)
	if err == nil && creds.AccessToken != "" {
		// Check if token is still valid
		if isTokenValid(creds) {
			m.isLoggedIn = true
			m.email = creds.Email
			m.accessToken = creds.AccessToken
			m.tokenType = creds.TokenType
			m.expiresIn = creds.ExpiresIn
			m.refreshToken = creds.RefreshToken
			// Token already set in global variable by loadCredentials
		}
	}

	return m
}

func (m model) Init() tea.Cmd {
	switch m.state {
	case menuState:
		return nil
	case inputState:
		return textinput.Blink
	case cacheState:
		return textinput.Blink
	case loginState:
		return textinput.Blink
	default:
		return nil
	}
}
