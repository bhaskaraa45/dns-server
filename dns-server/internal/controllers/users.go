package controllers

import (
	"encoding/json"
	"net/http"
	"time"

	"dns-server/internal/database"
	"dns-server/internal/models"
	"dns-server/internal/services"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	"golang.org/x/crypto/bcrypt"
)

// Controllers holds DB service
type Controllers struct {
	DB database.Service
}

func (uc *Controllers) SignUp(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Otp      string `json:"otp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate OTP here (omitted for brevity)
	otp, err := uc.DB.GetOTPByCode(input.Otp)
	if err != nil || otp == nil {
		http.Error(w, "Invalid OTP", http.StatusBadRequest)
		return
	}

	if otp.Used || time.Now().After(otp.ExpiresAt) {
		http.Error(w, "Expired OTP", http.StatusBadRequest)
		return
	}

	if otp.Email != input.Email {
		http.Error(w, "Invalid OTP", http.StatusBadRequest)
		return
	}

	if err := uc.DB.MarkOTPAsUsed(input.Otp); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	user := &models.User{
		ID:           uuid.New(),
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: HashPassword(input.Password),
		UserAgent:    r.UserAgent(),
		IP:           r.RemoteAddr,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	if err := uc.DB.CreateUser(user); err != nil {
		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := make(map[string]interface{})
	resp["id"] = user.ID
	resp["name"] = user.Name
	resp["email"] = user.Email
	resp["created_at"] = user.CreatedAt
	resp["message"] = "User created successfully"

	// create JWT token and send as cookie
	t, err := services.GenerateJWTToken(user.ID.String())
	if err != nil {
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    t,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(30 * 24 * time.Hour),
		Domain:   r.Host,
	})

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// ====================
// CREATE USER
// POST /users
// ====================
// func (uc *Controllers) CreateUser(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
// 	var input struct {
// 		Name     string `json:"name"`
// 		Email    string `json:"email"`
// 		Password string `json:"password"`
// 	}

// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		http.Error(w, "Invalid request body", http.StatusBadRequest)
// 		return
// 	}

// 	user := &models.User{
// 		ID:           uuid.New(),
// 		Name:         input.Name,
// 		Email:        input.Email,
// 		PasswordHash: HashPassword(input.Password),
// 		UserAgent:    r.UserAgent(),
// 		IP:           r.RemoteAddr,
// 		CreatedAt:    time.Now(),
// 		UpdatedAt:    time.Now(),
// 	}

// 	if err := uc.DB.CreateUser(user); err != nil {
// 		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusCreated)
// 	json.NewEncoder(w).Encode(user)
// }

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
		user.PasswordHash = HashPassword(*input.Password)
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

func HashPassword(password string) string {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash)
}
