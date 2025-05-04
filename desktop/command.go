package main

import (
	"net/http"

	tea "github.com/charmbracelet/bubbletea"
)

type statusMsg int
type errMsg error

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
