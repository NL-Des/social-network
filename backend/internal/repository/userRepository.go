package repository

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	"social-network/backend/internal/model"
)

// UserRepo gère toutes les interactions directes avec la table 'users' et 'followers' en base de données.
type UserRepo struct {
	db *sql.DB
}

// NewUserRepo initialise un nouveau repository pour les utilisateurs.
func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

// *** SELECT ***

// GetProfileByID récupère les données formatées pour l'affichage du profil (ex: Header de la Home).
// Il calcule le nombre de followers et formate le nom (Prénom + Initiale du nom).
func (r *UserRepo) GetFullProfileByID(id int) (model.FullProfile, error) {
	var profile model.FullProfile
	var birthDate time.Time
	var isprivate bool

	var pseudoNull sql.NullString
	err := r.db.QueryRow(`
		SELECT firstname, lastname, pseudo, email, dateofbirth, isprivate
		FROM users WHERE id = $1
	`, id).Scan(&profile.FirstName, &profile.LastName, &pseudoNull, &profile.Email, &birthDate, &isprivate)
	profile.Username = pseudoNull.String
	if err != nil {
		return model.FullProfile{}, err
	}

	profile.BirthDate = birthDate.Format("2006-01-02")

	if isprivate {
		profile.Visibility = "private"
	} else {
		profile.Visibility = "public"
	}

	r.db.QueryRow(`SELECT COUNT(*) FROM followers WHERE followingID = $1`, id).Scan(&profile.FollowersCount)

	if len(profile.FirstName) > 0 {
		profile.Initials += strings.ToUpper(string([]rune(profile.FirstName)[0]))
	}
	if len(profile.LastName) > 0 {
		profile.Initials += strings.ToUpper(string([]rune(profile.LastName)[0]))
	}

	return profile, nil
}

func (r *UserRepo) GetProfileByID(id int) (model.MeResponse, error) {
	var firstname, lastname string
	var pseudoNull sql.NullString

	// Récupération des infos de base
	err := r.db.QueryRow(`
    SELECT firstname, lastname, pseudo
    FROM users
    WHERE id = $1
  `, id).Scan(&firstname, &lastname, &pseudoNull)
	if err != nil {
		return model.MeResponse{}, err
	}
	pseudo := pseudoNull.String

	// Récupération du nombre total de followers pour cet utilisateur
	var followersCount int
	err = r.db.QueryRow(`
    SELECT COUNT(*) FROM followers WHERE followingID = $1
  `, id).Scan(&followersCount)
	if err != nil {
		return model.MeResponse{}, err
	}

	// Formatage du nom d'affichage : "John Doe" -> "John D"
	displayName := firstname
	if len(lastname) > 0 {
		displayName = firstname + " " + strings.ToUpper(string([]rune(lastname)[0]))
	}

	// Génération des initiales pour l'avatar par défaut (ex: "JD")
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

// GetUserbyID récupère l'intégralité des champs d'un utilisateur pour une page de profil complète.
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

func (r *UserRepo) GetPasswordHashByID(id int) (string, error) {
	var hash string
	err := r.db.QueryRow(`SELECT password FROM users WHERE id = $1`, id).Scan(&hash)
	return hash, err
}

// GetUserCredsbyEmail récupère l'ID, l'email et le hash du mot de passe pour la vérification au login.
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

// UserExists vérifie si un email ou un pseudo est déjà pris lors de l'inscription.
// Retourne (bool, typeDuConflit, error).
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

	// On identifie lequel des deux champs pose problème pour retourner un message d'erreur précis au front
	if existingEmail == email {
		return true, "email", nil
	}

	if existingUsername == username {
		return true, "username", nil
	}

	return false, "", nil
}

// GetAllUsers retourne tous les utilisateurs sauf l'utilisateur courant,
// avec un flag indiquant si le courant les suit (status = 'accepted').
func (r *UserRepo) GetAllUsers(currentUserID int) ([]model.UserListItem, error) {
	rows, err := r.db.Query(`
		SELECT
			u.id,
			u.firstname,
			u.lastname,
			CASE WHEN f.followerid IS NOT NULL THEN true ELSE false END AS following,
			u.isprivate,
			COALESCE(u.avatar, '')
		FROM users u
		LEFT JOIN followers f
			ON f.followerid = $1
			AND f.followingid = u.id
			AND f.status = 'accepted'
		WHERE u.id != $1
		ORDER BY u.firstname, u.lastname
	`, currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.UserListItem
	for rows.Next() {
		var item model.UserListItem
		var firstname, lastname string
		if err := rows.Scan(&item.ID, &firstname, &lastname, &item.Following, &item.IsPrivate, &item.Avatar); err != nil {
			return nil, err
		}
		item.Name = firstname
		if len(lastname) > 0 {
			item.Name += " " + strings.ToUpper(string([]rune(lastname)[0]))
		}
		if len(firstname) > 0 {
			item.Initials += strings.ToUpper(string([]rune(firstname)[0]))
		}
		if len(lastname) > 0 {
			item.Initials += strings.ToUpper(string([]rune(lastname)[0]))
		}
		users = append(users, item)
	}
	return users, rows.Err()
}

// *** INSERT ***

// SaveUser insère un nouvel utilisateur en base de données après validation du formulaire d'inscription.
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
