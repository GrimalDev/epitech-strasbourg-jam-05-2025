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
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result[0])
}

func (h *HackingSpotHandler) GetFromLatAndLong(c echo.Context) error {
	// Default coordinates for Paris
	defaultLat := "48.8566"
	defaultLong := "2.3522"

	// Get latitude and longitude from params
	lat := c.QueryParam("lat")
	long := c.QueryParam("long")

	// Use default values if not provided
	if lat == "" {
		lat = defaultLat
	}

	if long == "" {
		long = defaultLong
	}

	// Convert string coordinates to float
	latFloat, err := strconv.ParseFloat(lat, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid latitude format"})
	}

	longFloat, err := strconv.ParseFloat(long, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid longitude format"})
	}

	// Calculate approximately 1km in degrees
	// This is a rough approximation as 0.01 degrees is about 1.11km at the equator
	// and varies with latitude
	const radiusInDegrees = 0.009

	var result []models.HackingSpot

	err = h.client.DB.Rpc("get_hacking_spots_near", map[string]any{
		"center_lat":  latFloat,
		"center_long": longFloat,
		"radius":      radiusInDegrees,
	}).Execute(&result)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if len(result) == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "No hacking spots found in this area"})
	}

	return c.JSON(http.StatusOK, result)
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
