package services

import (
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

var jwtSecret = []byte("your_secret_key")

func GenerateJWTToken(userId string) (string, error) {
	claims := &jwt.StandardClaims{
		Subject:   userId,
		ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
