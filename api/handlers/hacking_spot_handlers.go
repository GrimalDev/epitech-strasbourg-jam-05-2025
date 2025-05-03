package handlers

import (
	"net/http"
	"strconv"
	"travelroot/models"

	"github.com/labstack/echo/v4"
	"github.com/nedpals/supabase-go"
)

type HackingSpotHandler struct {
	client *supabase.Client
}

func NewHackingSpotHandler(client *supabase.Client) *HackingSpotHandler {
	return &HackingSpotHandler{client: client}
}

func (h *HackingSpotHandler) Create(c echo.Context) error {
	var spot models.HackingSpot
	if err := c.Bind(&spot); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	var result []models.HackingSpot
	err := h.client.DB.From("hacking_spots").Insert(spot).Execute(&result)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create"})
	}

	return c.JSON(http.StatusCreated, result[0])
}

func (h *HackingSpotHandler) Get(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	var result []models.HackingSpot
	err = h.client.DB.From("hacking_spots").Select("*").Eq("id", strconv.Itoa(id)).Execute(&result)
	if err != nil || len(result) == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Not found"})
	}

	return c.JSON(http.StatusOK, result[0])
}

func (h *HackingSpotHandler) Update(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	var spot models.HackingSpot
	if err := c.Bind(&spot); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	var result []models.HackingSpot
	err = h.client.DB.From("hacking_spots").Update(spot).Eq("id", strconv.Itoa(id)).Execute(&result)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update"})
	}

	return c.JSON(http.StatusOK, result[0])
}

func (h *HackingSpotHandler) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	var result []models.HackingSpot
	err = h.client.DB.From("hacking_spots").Delete().Eq("id", strconv.Itoa(id)).Execute(&result)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete"})
	}

	return c.NoContent(http.StatusNoContent)
}
