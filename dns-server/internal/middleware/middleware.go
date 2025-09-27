package middleware

import (
	"context"
	"net/http"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/julienschmidt/httprouter"
)

var jwtSecret = []byte("your_secret_key")

type contextKey string

const userIDKey contextKey = "userID"

// Middleware for httprouter.Handle
func AuthMiddleware(routerHandle httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Missing auth cookie", http.StatusUnauthorized)
			return
		}

		tokenString := cookie.Value

		claims := &jwt.StandardClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, claims.Subject)

		routerHandle(w, r.WithContext(ctx), ps)
	}
}

// GetUserID helper
func GetUserID(r *http.Request) string {
	if uid, ok := r.Context().Value(userIDKey).(string); ok {
		return uid
	}
	return ""
}
