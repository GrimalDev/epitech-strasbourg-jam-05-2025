package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	tea "github.com/charmbracelet/bubbletea"
)

func main() {
	f, err := tea.LogToFile("debug.log", "debug")
	if err != nil {
		fmt.Println("fatal:", err)
		os.Exit(1)
	}

	errDotEnv := godotenv.Load()
	if errDotEnv != nil {
		log.Fatal("Error loading .env file")
	}
	// fmt.Println("Starting the program...")

	p := tea.NewProgram(initialModel())
	if _, err := p.Run(); err != nil {
		log.Printf("Error: %v", err)
		os.Exit(1)
	}

	defer f.Close()
}
