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
)

type model struct {
	state     state
	menu      list.Model
	textInput textinput.Model
	status    int
	err       error
	url       string
}

// InitialModel creates and returns the initial application model
func initialModel() model {
	items := []list.Item{
		item{title: "Check URL", desc: "Enter a URL to check its status"},
		item{title: "Exit", desc: "Quit the program"},
	}

	// Set specific dimensions for the menu to leave space for ASCII art
	m := list.New(items, list.NewDefaultDelegate(), 0, 0)
	m.SetShowTitle(false)
	// m.Title = asciiArt
	// m.Styles.Title = m.Styles.Title.Background(lipgloss.NoColor{})

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
