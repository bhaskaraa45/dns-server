package controllers

import (
	"crypto/rand"
	"dns-server/internal/models"
	"encoding/json"
	"math/big"
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
)

func (c *Controllers) SendOtp(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		Email string `json:"email"`
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
