package config

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
)

func LoadConfig() (*supabase.Client, error) {
	godotenv.Load()
	supabaseURL := os.Getenv("API_INTERNAL_URL")
	supabaseKey := os.Getenv("SERVICE_ROLE_KEY")
	return supabase.CreateClient(supabaseURL, supabaseKey), nil
}
