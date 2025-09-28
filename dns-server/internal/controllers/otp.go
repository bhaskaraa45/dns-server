package controllers

import (
	"crypto/rand"
	"dns-server/internal/models"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/julienschmidt/httprouter"
)

func (c *Controllers) SendOtp(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		Email string `json:"email"`
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	otp := generateOTP()

	c.DB.InsertOTP(&models.OTP{
		Email:     input.Email,
		OtpCode:   otp,
		ExpiresAt: time.Now().Add(5 * time.Minute), // OTP valid for 5 minutes
		Used:      false,
		CreatedAt: time.Now(),
	})

	go c.sendOTPMail(r, input.Email, input.Name, otp)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message":"OTP sent successfully"}`))
}

func generateOTP() string {
	const digits = "0123456789"
	otp := make([]byte, 6)

	for i := range otp {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		otp[i] = digits[num.Int64()]
	}

	return string(otp)
}

func (c *Controllers) sendOTPMail(r *http.Request, email, userName, otp string) {
	// Extract user IP and approximate location (you might use a GeoIP service here)
	currentTime := time.Now().Format("3:04 PM MST")

	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}

	if strings.Contains(ip, ":") {
		ip = strings.Split(ip, ":")[0]
	}

	location := getLocationFromIP(ip)

	templateData := map[string]string{
		"USER_NAME":        userName,
		"OTP_CODE":         otp,
		"VALIDITY_MINUTES": "5",
		"USER_IP":          ip,
		"USER_LOCATION":    location,
		"TIME":             currentTime,
	}

	htmlBody, err := loadAndPopulateTemplate("assets/otp-template.html", templateData)
	if err != nil {
		log.Printf("ERROR: Could not load email template for %s: %v", email, err)
		return
	}

	err = c.SendMail(email, nil, "Verification Code -- AA45 DNS MANAGER", htmlBody)
	if err != nil {
		log.Printf("ERROR: Could not send OTP email to %s: %v", email, err)
	} else {
		log.Printf("Successfully sent OTP email to %s", email)
	}
}

func loadAndPopulateTemplate(filePath string, data map[string]string) ([]byte, error) {
	template, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	htmlContent := string(template)
	for key, value := range data {
		placeholder := "{{" + key + "}}"
		htmlContent = strings.ReplaceAll(htmlContent, placeholder, value)
	}

	return []byte(htmlContent), nil
}

func getLocationFromIP(ip string) string {
	url := fmt.Sprintf("http://ip-api.com/json/%s", ip)
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Failed to get location for IP %s: %v", ip, err)
		return "Unknown Location"
	}
	defer resp.Body.Close()

	var geoData struct {
		Status  string `json:"status"`
		Country string `json:"country"`
		City    string `json:"city"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geoData); err != nil {
		log.Printf("Failed to parse geo data for IP %s: %v", ip, err)
		return "India"
	}

	if geoData.Status == "success" && geoData.City != "" && geoData.Country != "" {
		return fmt.Sprintf("%s, %s", geoData.City, geoData.Country)
	}

	return "India"
}
