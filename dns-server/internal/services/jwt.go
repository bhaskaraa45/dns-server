package services

import (
	"dns-server/internal/constants"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

func GenerateJWTToken(userId string) (string, error) {
	claims := &jwt.StandardClaims{
		Subject:   userId,
		ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(constants.JWTSecretKey)
}

func ValidateJWTToken(tokenString string) (*jwt.StandardClaims, error) {
	claims := &jwt.StandardClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return constants.JWTSecretKey, nil
	})
	
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}