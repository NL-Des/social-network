package repository

import (
	"database/sql"
	"errors"
	"strings"

	"social-network/backend/internal/model"
)

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

// *** SELECT ***

func (r *UserRepo) GetProfileByID(id int) (model.MeResponse, error) {
	var firstname, lastname, pseudo string

	err := r.db.QueryRow(`
		SELECT firstname, lastname, pseudo
		FROM users
		WHERE id = $1
	`, id).Scan(&firstname, &lastname, &pseudo)
	if err != nil {
		return model.MeResponse{}, err
	}

	var followersCount int
	err = r.db.QueryRow(`
		SELECT COUNT(*) FROM followers WHERE followingID = $1
	`, id).Scan(&followersCount)
	if err != nil {
		return model.MeResponse{}, err
	}

	displayName := firstname
	if len(lastname) > 0 {
		displayName = firstname + " " + strings.ToUpper(string([]rune(lastname)[0]))
	}

	initials := ""
	if len(firstname) > 0 {
		initials += strings.ToUpper(string([]rune(firstname)[0]))
	}
	if len(lastname) > 0 {
		initials += strings.ToUpper(string([]rune(lastname)[0]))
	}

	return model.MeResponse{
		Name:      displayName,
		Username:  pseudo,
		Followers: followersCount,
		Initials:  initials,
	}, nil
}

func (r *UserRepo) GetUserbyID(id int) (model.User, error) {
	var user model.User

	err := r.db.QueryRow(`
		SELECT id, name, firstName, birthday, email, username, description, profilePicture, isprivate
		FROM users
		WHERE id = $1
	`, id).Scan(
		&user.ID,
		&user.Name,
		&user.FirstName,
		&user.Birthday,
		&user.Email,
		&user.Username,
		&user.Description,
		&user.ProfilePicture,
		&user.IsPrivate,
	)

	if err != nil {
		return model.User{}, err
	}
	return user, nil
}

func (r *UserRepo) GetUserCredsbyEmail(email string) (model.LoginUser, error) {
	var user model.LoginUser

	err := r.db.QueryRow(`
		SELECT id, email, password
		FROM users
		WHERE email = $1
	`, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
	)

	if err == sql.ErrNoRows {
		return model.LoginUser{}, errors.New("Email inconnu")
	}

	if err != nil {
		return model.LoginUser{}, err
	}
	return user, nil
}

func (r *UserRepo) UserExists(email, username string) (bool, string, error) {
	var existingEmail, existingUsername string

	err := r.db.QueryRow(`
		SELECT email, pseudo
		FROM users
		WHERE email = $1 OR pseudo = $2
	`, email, username).Scan(&existingEmail, &existingUsername)

	if err == sql.ErrNoRows {
		return false, "", nil
	}

	if err != nil {
		return false, "", err
	}

	if existingEmail == email {
		return true, "email", nil
	}

	if existingUsername == username {
		return true, "username", nil
	}

	return false, "", nil
}

// *** INSERT ***

func (r *UserRepo) SaveUser(user model.RegisterUser) error {
	_, err := r.db.Exec(`
		INSERT INTO users (
			email,
			password,
			firstname,
			lastname,
			dateofbirth,
			isprivate,
			avatar,
			pseudo,
			aboutme
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`,
		user.Email,
		user.Password,
		user.FirstName,
		user.Name,
		user.Birthday,
		user.IsPrivate,
		user.ProfilePicture,
		user.Username,
		user.Description,
	)

	return err
}
