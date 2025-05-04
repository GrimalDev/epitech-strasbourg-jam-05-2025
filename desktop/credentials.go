package main

import (
	"encoding/json"
	"os"
	"time"
)

type Credentials struct {
	Email        string          `json:"email"`
	Password     string          `json:"password"`
	AccessToken  string          `json:"access_token"`
	TokenType    string          `json:"token_type"`
	ExpiresIn    int             `json:"expires_in"`
	ExpiresAt    int             `json:"expires_at"`
	RefreshToken string          `json:"refresh_token"`
	User         json.RawMessage `json:"user,omitempty"`
}

func saveCredentials(filename, email, password string) error {
	creds := Credentials{
		Email:    email,
		Password: password,
	}

	data, err := json.Marshal(creds)
	if err != nil {
		return err
	}

	return os.WriteFile(filename, data, 0600)
}

// SaveAuthResponse saves the complete authentication response to the credentials file
func saveAuthResponse(filename string, email, password string, authResp authResponseMsg) error {
	creds := Credentials{
		Email:        email,
		Password:     password,
		AccessToken:  authResp.AccessToken,
		TokenType:    authResp.TokenType,
		ExpiresIn:    authResp.ExpiresIn,
		ExpiresAt:    authResp.ExpiresAt,
		RefreshToken: authResp.RefreshToken,
		User:         authResp.User,
	}

	data, err := json.Marshal(creds)
	if err != nil {
		return err
	}

	// Update the global token for immediate use
	currentToken = authResp.AccessToken

	return os.WriteFile(filename, data, 0600)
}

func loadCredentials(filename string) (Credentials, error) {
	var creds Credentials

	data, err := os.ReadFile(filename)
	if err != nil {
		return creds, err
	}

	err = json.Unmarshal(data, &creds)
	if err == nil && creds.AccessToken != "" {
		// Set the global token when credentials are loaded
		currentToken = creds.AccessToken
	}

	return creds, err
}

// IsTokenValid checks if the stored token is still valid based on expiration time
func isTokenValid(creds Credentials) bool {
	// If no token or expires_at is missing, token is invalid
	if creds.AccessToken == "" || creds.ExpiresAt == 0 {
		return false
	}

	// Get current Unix timestamp
	now := int(time.Now().Unix())

	// Check if token is expired
	return now < creds.ExpiresAt
}
