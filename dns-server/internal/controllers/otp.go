package controllers

import (
	"dns-server/internal/models"
	"encoding/json"
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
)

func (c *Controllers) SendOtp(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		Email string `json:"email"`
		Otp   string `json:"otp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	c.DB.InsertOTP(&models.OTP{
		Email:     input.Email,
		OtpCode:   input.Otp,
		ExpiresAt: time.Now().Add(5 * time.Minute), // OTP valid for 5 minutes
		Used:      false,
		CreatedAt: time.Now(),
	})

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message":"OTP sent successfully"}`))
}
