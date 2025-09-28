package constants

import "os"

var (
	// JWTSecretKey is the secret key used for signing JWT tokens
	JWTSecretKey = getJWTSecretKey()
)

const (
	// CookieName is the name of the authentication cookie
	CookieName = "session"
	// UserContextKey is the context key for storing user ID in request context
	UserContextKey = "userID"
)


func getJWTSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret == "" {
		secret = "default_secret_key"
	}
	return []byte(secret)
}