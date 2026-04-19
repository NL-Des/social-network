package service

import "golang.org/x/crypto/bcrypt"

func IsValidPassword(password, savedPasseword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(savedPasseword), []byte(password))
	if err != nil {
		return false
	}

	return true
}
