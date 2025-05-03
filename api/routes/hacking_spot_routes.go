package routes

import (
	"github.com/labstack/echo/v4"
	"travelroot/handlers"
)

func RegisterHackingSpotRoutes(e *echo.Echo, handler *handlers.HackingSpotHandler) {
	e.POST("/hacking-spots", handler.Create)
	e.GET("/hacking-spots/:id", handler.Get)
	e.PUT("/hacking-spots/:id", handler.Update)
	e.DELETE("/hacking-spots/:id", handler.Delete)
}
