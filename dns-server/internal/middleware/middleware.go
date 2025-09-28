package middleware

import (
	"context"
	"dns-server/internal/database"
	"dns-server/internal/models"
	"dns-server/internal/services"
	"dns-server/internal/utils"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

var jwtSecret = []byte("secret_key")

type contextKey string

const userIDKey contextKey = "userID"

type Middleware struct {
	DB database.Service
}

// Middleware for httprouter.Handle
func (m *Middleware) AuthMiddleware(routerHandle httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		cookie, err := r.Cookie("session")
		if err != nil {
			utils.Error(w, http.StatusUnauthorized, "Missing auth cookie")
			return
		}

		tokenString := cookie.Value

		claims, err := services.ValidateJWTToken(tokenString)

		if err != nil {
			utils.Error(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, claims.Subject)

		routerHandle(w, r.WithContext(ctx), ps)

		go m.TrackUserActivity(claims.Subject, r.Method+" "+r.URL.Path, r.RemoteAddr, r.UserAgent())
	}
}

// GetUserID helper
func GetUserID(r *http.Request) string {
	if uid, ok := r.Context().Value(userIDKey).(string); ok {
		return uid
	}
	return ""
}

func (m *Middleware) TrackUserActivity(userID string, activity string, ip string, agent string) {
	_ = m.DB.UpdateUserIPAndAgent(userID, ip, agent)

	uuid, err := uuid.Parse(userID)
	if err != nil {
		return
	}

	log := &models.IPLog{
		UserID:    uuid,
		IP:        ip,
		Action:    activity,
		CreatedAt: time.Now(),
	}
	_ = m.DB.CreateIPLog(log)
}
