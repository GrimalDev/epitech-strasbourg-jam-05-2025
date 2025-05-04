package seeder

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"travelroot/config"
	"travelroot/models"

	"github.com/nedpals/supabase-go"
)

func SeedHackingSpots(client *supabase.Client, count int) error {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	names := []string{"Cyber Hub", "Tech Den", "Code Cave", "Hack Base", "Digital Nest"}
	difficulties := []string{"Easy", "Medium", "Hard"}

	for i := range count {
		spot := models.HackingSpot{
			PublicID:   fmt.Sprintf("%06d", rng.Intn(999999)),
			Name:       names[rng.Intn(len(names))] + fmt.Sprintf(" %d", i+1),
			Latitude:   90.0*rng.Float64() - 45.0,  // Random lat (-45 to 45)
			Longitude:  180.0*rng.Float64() - 90.0, // Random lon (-90 to 90)
			Difficulty: difficulties[rng.Intn(len(difficulties))],
		}

		var result []models.HackingSpot
		err := client.DB.From("hacking_spots").Insert(spot).Execute(&result)
		if err != nil {
			return fmt.Errorf("failed to seed spot %d: %v", i+1, err)
		}
	}

	return nil
}

func Run(count int) error {
	client, err := config.LoadConfig()
	if err != nil {
		return fmt.Errorf("failed to load config: %v", err)
	}

	log.Printf("Seeding %d hacking spots...", count)
	if err := SeedHackingSpots(client, count); err != nil {
		return fmt.Errorf("seeding failed: %v", err)
	}
	log.Println("Seeding completed successfully")
	return nil
}
