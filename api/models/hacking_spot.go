package models

type HackingSpot struct {
	ID         int     `json:"id"`
	PublicID   string  `json:"public_id"`
	Name       string  `json:"name"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Difficulty string  `json:"difficulty"`
}
