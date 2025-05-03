package main

import (
	"log"
	"travelroot/config"
	"travelroot/handlers"
	"travelroot/routes"

	"github.com/labstack/echo/v4"
)

func main() {
	client, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	handler := handlers.NewHackingSpotHandler(client)
	e := echo.New()

	routes.RegisterHackingSpotRoutes(e, handler)

	log.Fatal(e.Start(":8080"))
}
