package repository

import (
	"database/sql"
	"errors"
	"log"
)

// wrapDBError loggue l'erreur technique côté serveur et renvoie un message
// générique sûr à exposer au client, sauf si err est déjà une erreur "métier"
// volontairement créée avec fmt.Errorf/errors.New (auquel cas on la laisse passer).
func wrapDBError(err error, context string) error {
	if err == nil || err == sql.ErrNoRows {
		return err
	}
	log.Printf("[db] %s: %v", context, err)
	return errors.New("une erreur est survenue, veuillez réessayer")
}
