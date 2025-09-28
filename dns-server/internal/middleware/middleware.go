package middleware

import (
	"context"
	"dns-server/internal/constants"
	"dns-server/internal/database"
	"dns-server/internal/models"
	"dns-server/internal/services"
	"dns-server/internal/utils"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type contextKey string

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

		ctx := context.WithValue(r.Context(), constants.UserContextKey, claims.Subject)

		utils.RefreshCookie(w, r, claims.Subject)
		
		routerHandle(w, r.WithContext(ctx), ps)

		go m.TrackUserActivity(claims.Subject, r.Method+" "+r.URL.Path, r.RemoteAddr, r.UserAgent())
	}
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
