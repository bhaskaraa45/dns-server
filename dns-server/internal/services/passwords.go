package services

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) string {
	fmt.Println("Password:", password)
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash)
}

func CheckPasswordHash(password, hash string) bool {
	fmt.Println("Hash:", hash)
	fmt.Println("Password to check:", password)
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Println("Password hash comparison error:", err)
	}
	return err == nil
}
