package handlers

import (
	"fmt"
	"net/http"
)

// HomeHandler répond simplement avec un message
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Bienvenue sur le serveur Go !")
}
