package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	tea "github.com/charmbracelet/bubbletea"
)

type statusMsg int
type errMsg error
type responseBodyMsg string
type authResponseMsg struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	ExpiresAt    int    `json:"expires_at"`
	RefreshToken string `json:"refresh_token"`
	User         json.RawMessage
}

func checkServer(m model, spot_id string) tea.Cmd {
	return func() tea.Msg {
		// Try to load credentials if no token is available
		if currentToken == "" {
			creds, err := loadCredentials("credentials.json")
			if err == nil && isTokenValid(creds) {
				currentToken = creds.AccessToken
			}
		}

		// baseURL := "http://localhost:8000/rest/v1/hacking_spots"
		baseURL := "https://travelroot.baptistegrimaldi.com/rest/v1/hacking_spots"

		client := &http.Client{}
		req, err := http.NewRequest("GET", baseURL, nil)
		if err != nil {
			return errMsg(err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("apikey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDYyMjMyMDAsImV4cCI6MTkwMzk4OTYwMH0.iINtf0FjLnI-ObXf6DCz62EF3aqAAxgmXOm-Eov7vVw")

		q := req.URL.Query()
		q.Add("select", "description")
		q.Add("public_id", "eq."+spot_id)

		// Add authorization header if available
		if currentToken != "" {
			req.Header.Add("Authorization", "Bearer "+currentToken)
		}

		req.URL.RawQuery = q.Encode()

		resp, err := client.Do(req)
		if err != nil {
			return errMsg(err)
		}
		defer resp.Body.Close()

		// Read the response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return errMsg(err)
		}

		// Convert JSON response to a description message
		var spotResponses []map[string]any
		if err := json.Unmarshal(body, &spotResponses); err != nil {
			return errMsg(err)
		}

		// Check if we got any results
		if len(spotResponses) == 0 {
			return descriptionMsg("No spot found with ID: " + spot_id)
		}

		// Extract the description from the first result
		description, ok := spotResponses[0]["description"].(string)
		if !ok {
			return descriptionMsg("No description available for this spot")
		}

		return descriptionMsg(description)
	}
}

func checkFlag(spot_id string, flag string) tea.Cmd {
	return func() tea.Msg {
		// Try to load credentials if no token is available
		if currentToken == "" {
			creds, err := loadCredentials("credentials.json")
			if err == nil && isTokenValid(creds) {
				currentToken = creds.AccessToken
			}
		}

		// baseURL := "http://localhost:8000/rest/v1/hacking_spots"
		baseURL := "https://travelroot.baptistegrimaldi.com/rest/v1/hacking_spots"

		client := &http.Client{}
		req, err := http.NewRequest("GET", baseURL, nil)
		if err != nil {
			return errMsg(err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("apikey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDYyMjMyMDAsImV4cCI6MTkwMzk4OTYwMH0.iINtf0FjLnI-ObXf6DCz62EF3aqAAxgmXOm-Eov7vVw")
		q := req.URL.Query()
		q.Add("flag", "eq."+flag)
		q.Add("public_id", "eq."+spot_id)

		// Add authorization header if available
		if currentToken != "" {
			req.Header.Add("Authorization", "Bearer "+currentToken)
		}

		req.URL.RawQuery = q.Encode()

		resp, err := client.Do(req)
		if err != nil {
			return errMsg(err)
		}
		defer resp.Body.Close()

		// Read the response body
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			return errMsg(err)
		}

		var result []map[string]any
		err = json.Unmarshal(bodyBytes, &result)
		if err != nil {
			return errMsg(err)
		}

		if len(result) == 0 {
			return statusMsg(404)
		}

		return statusMsg(resp.StatusCode)
	}
}

func authenticate(email, password string) tea.Cmd {
	return func() tea.Msg {
		// Create the request payload
		payload := map[string]string{
			"email":    email,
			"password": password,
		}

		jsonData, err := json.Marshal(payload)
		if err != nil {
			return errMsg(err)
		}

		// Create the HTTP request
		req, err := http.NewRequest(
			"POST",
			"http://localhost:8000/auth/v1/token?grant_type=password",
			// "https://travelroot.baptistegrimaldi.com/auth/v1/token?grant_type=password",
			bytes.NewBuffer(jsonData),
		)
		if err != nil {
			return errMsg(err)
		}

		// Set the required headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("apikey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NDYyMjMyMDAsImV4cCI6MTkwMzk4OTYwMH0.iINtf0FjLnI-ObXf6DCz62EF3aqAAxgmXOm-Eov7vVw")

		// Send the request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return errMsg(err)
		}
		defer resp.Body.Close()

		// Read and parse the response
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return errMsg(err)
		}

		if resp.StatusCode != http.StatusOK {
			return errMsg(fmt.Errorf("authentication failed: %s", body))
		}

		var authResp map[string]any
		err = json.Unmarshal(body, &authResp)
		if err != nil {
			return errMsg(err)
		}

		// Return the authentication response
		return authResponseMsg{
			AccessToken:  authResp["access_token"].(string),
			TokenType:    authResp["token_type"].(string),
			ExpiresIn:    int(authResp["expires_in"].(float64)),
			ExpiresAt:    int(authResp["expires_at"].(float64)),
			RefreshToken: authResp["refresh_token"].(string),
			User:         body, // Store the full JSON for user info
		}
	}
}
