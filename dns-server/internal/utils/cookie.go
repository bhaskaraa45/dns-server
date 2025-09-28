package utils

import (
	"dns-server/internal/constants"
	"dns-server/internal/services"
	"net/http"
	"time"
)

func SetCookie(w http.ResponseWriter, r *http.Request, value string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(30 * 24 * time.Hour), // 30 days
		Domain:   r.Host,
	})
}

// GetUserID helper
func GetUserID(r *http.Request) string {
	if uid, ok := r.Context().Value(constants.UserContextKey).(string); ok {
		return uid
	}
	return ""
}

// Refresh Cookie
func RefreshCookie(w http.ResponseWriter, r *http.Request, userId string) error {
	token, err := services.GenerateJWTToken(userId)
	if err != nil {
		return err
	}
	SetCookie(w, r, token)
	return nil
}

func ClearCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		Value:  "",
		Path:   "/",
		Expires: time.Unix(0, 0),
		Domain: r.Host,
	})
}

