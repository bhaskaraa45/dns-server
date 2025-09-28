package controllers

import (
	"encoding/json"
	"net/http"
	"time"

	"dns-server/internal/database"
	"dns-server/internal/models"
	"dns-server/internal/services"
	"dns-server/internal/utils"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

// Controllers holds DB service
type Controllers struct {
	DB database.Service
	services.SmtpService
}

func (uc *Controllers) SignUp(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Otp      string `json:"otp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	otp, err := uc.DB.GetOTPByCode(input.Otp)
	if err != nil || otp == nil {
		utils.Error(w, http.StatusBadRequest, "Invalid OTP")
		return
	}

	if otp.Used || time.Now().After(otp.ExpiresAt) {
		utils.Error(w, http.StatusBadRequest, "Expired OTP")
		return
	}

	if otp.Email != input.Email {
		utils.Error(w, http.StatusBadRequest, "OTP does not match email")
		return
	}

	if err := uc.DB.MarkOTPAsUsed(input.Otp); err != nil {
		utils.Error(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	// Check if user already exists
	existingUser, _ := uc.DB.GetUserByEmail(input.Email)
	if existingUser != nil {
		utils.Error(w, http.StatusConflict, "User with this email already exists")
		return
	}

	user := &models.User{
		ID:           uuid.New(),
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: services.HashPassword(input.Password),
		UserAgent:    r.UserAgent(),
		IP:           r.RemoteAddr,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := uc.DB.CreateUser(user); err != nil {
		utils.Error(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	// Generate JWT token
	token, err := services.GenerateJWTToken(user.ID.String())
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	utils.SetCookie(w, r, token)
	utils.Created(w, "User created successfully", map[string]interface{}{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"created_at": user.CreatedAt,
	})
}

// Get Me - GET /me
func (uc *Controllers) GetMe(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	userID := utils.GetUserID(r)
	if userID == uuid.Nil {
		utils.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := uc.DB.GetUserByID(userID.String())
	if err != nil {
		utils.Error(w, http.StatusNotFound, "User not found")
		return
	}
	u := struct {
		ID    uuid.UUID `json:"id"`
		Name  string    `json:"name"`
		Email string    `json:"email"`
	}{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

// ====================
// GET USER BY ID
// GET /users/:id
// ====================
func (uc *Controllers) GetUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := ps.ByName("id")
	if id == "" {
		http.Error(w, "Missing user id", http.StatusBadRequest)
		return
	}

	user, err := uc.DB.GetUserByID(id)
	if err != nil {
		http.Error(w, "User not found: "+err.Error(), http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(user)
}

// ====================
// UPDATE USER
// PUT /users/:id
// ====================
func (uc *Controllers) UpdateUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := ps.ByName("id")
	if id == "" {
		http.Error(w, "Missing user id", http.StatusBadRequest)
		return
	}

	var input struct {
		Name     *string `json:"name"`
		Email    *string `json:"email"`
		Password *string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := uc.DB.GetUserByID(id)
	if err != nil {
		http.Error(w, "User not found: "+err.Error(), http.StatusNotFound)
		return
	}

	if input.Name != nil {
		user.Name = *input.Name
	}
	if input.Email != nil {
		user.Email = *input.Email
	}
	if input.Password != nil {
		user.PasswordHash = services.HashPassword(*input.Password)
	}
	user.UpdatedAt = time.Now()

	if err := uc.DB.UpdateUser(user); err != nil {
		http.Error(w, "Failed to update user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(user)
}

// ====================
// DELETE USER
// DELETE /users/:id
// ====================
func (uc *Controllers) DeleteUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := ps.ByName("id")
	if id == "" {
		http.Error(w, "Missing user id", http.StatusBadRequest)
		return
	}

	if err := uc.DB.DeleteUser(id); err != nil {
		http.Error(w, "Failed to delete user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
