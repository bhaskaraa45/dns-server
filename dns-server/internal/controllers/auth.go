package controllers

import (
	"dns-server/internal/services"
	"dns-server/internal/utils"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

func (c *Controllers) Login(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := c.DB.GetUserByEmail(input.Email)

	if err != nil || user == nil || !services.CheckPasswordHash(input.Password, user.PasswordHash) {
		utils.Error(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := services.GenerateJWTToken(user.ID.String())
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// set token in cookie
	utils.SetCookie(w, r, token)

	u := map[string]interface{}{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	}

	utils.Success(w, "Login successful", map[string]interface{}{
		"user":  u,
	})
}

func (c *Controllers) Logout(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	utils.ClearCookie(w, r)
	utils.Success(w, "Logout successful", nil)
}

func (c *Controllers) ResetPassword(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		Email       string `json:"email"`
		NewPassword string `json:"new_password"`
		Password    string `json:"password,omitempty"`
		Otp         string `json:"otp,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// if old password is provided, verify it
	if input.Password != "" {
		userID := utils.GetUserID(r)
		if userID == uuid.Nil {
			utils.Error(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		user, err := c.DB.GetUserByID(userID.String())
		if err != nil || user == nil || !services.CheckPasswordHash(input.Password, user.PasswordHash) {
			utils.Error(w, http.StatusUnauthorized, "Invalid current password")
			return
		}

		user.PasswordHash = services.HashPassword(input.NewPassword)
		if err := c.DB.UpdateUser(user); err != nil {
			utils.Error(w, http.StatusInternalServerError, "Failed to update password")
			return
		}

		utils.Success(w, "Password reset successful", nil)
		return
	}

	// if OTP is provided, verify it
	if input.Otp == "" {
		utils.Error(w, http.StatusBadRequest, "OTP is required for password reset")
		return
	}

	otp, err := c.DB.GetOTPByCode(input.Otp)
	if err != nil || otp == nil {
		utils.Error(w, http.StatusBadRequest, "Invalid OTP")
		return
	}

	if otp.Used || time.Now().After(otp.ExpiresAt) {
		utils.Error(w, http.StatusBadRequest, "Expired OTP")
		return
	}

	if otp.Email != input.Email {
		utils.Error(w, http.StatusBadRequest, "Invalid OTP")
		return
	}

	user, err := c.DB.GetUserByEmail(input.Email)
	if err != nil || user == nil {
		utils.Error(w, http.StatusBadRequest, "User not found; Create an account first")
		return
	}

	user.PasswordHash = services.HashPassword(input.NewPassword)
	if err := c.DB.UpdateUser(user); err != nil {
		utils.Error(w, http.StatusInternalServerError, "Failed to update password")
		return
	}

	_ = c.DB.MarkOTPAsUsed(input.Otp)

	utils.Success(w, "Password reset successful", nil)
}
