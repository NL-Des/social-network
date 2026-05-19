package repository

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	appErrors "social-network/backend/internal/errors"
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

	err := r.db.QueryRow(`
		SELECT firstname, lastname, pseudo, email, dateofbirth, isprivate
		FROM users WHERE id = $1
	`, id).Scan(&profile.FirstName, &profile.LastName, &profile.Username, &profile.Email, &birthDate, &isprivate)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.FullProfile{}, appErrors.New(appErrors.CodeNotFound, "le profil utilisateur demandé n'existe pas", err)
		}
		return model.FullProfile{}, appErrors.New(appErrors.CodeInternal, "erreur serveur lors de la récupération du profil", err)
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
	var firstname, lastname, pseudo string

	// Récupération des infos de base
	err := r.db.QueryRow(`
    SELECT firstname, lastname, pseudo
    FROM users
    WHERE id = $1
  `, id).Scan(&firstname, &lastname, &pseudo)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.MeResponse{}, appErrors.New(appErrors.CodeNotFound, "utilisateur introuvable", err)
		}
		return model.MeResponse{}, appErrors.New(appErrors.CodeInternal, "erreur serveur", err)
	}

	// Récupération du nombre total de followers pour cet utilisateur
	var followersCount int
	err = r.db.QueryRow(`
    SELECT COUNT(*) FROM followers WHERE followingID = $1
  `, id).Scan(&followersCount)
	if err != nil {
		return model.MeResponse{}, appErrors.New(appErrors.CodeInternal, "erreur serveur", err)
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
		if errors.Is(err, sql.ErrNoRows) {
			return model.User{}, appErrors.New(appErrors.CodeNotFound, "compte utilisateur inexistant", err)
		}
		return model.User{}, appErrors.New(appErrors.CodeInternal, "erreur lors du chargement des données utilisateur", err)
	}
	return user, nil
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

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// TRADUCTION : Remplacement du raw error par notre AppError typée
			return model.LoginUser{}, appErrors.New(appErrors.CodeNotFound, "identifiants incorrects (email inconnu)", err)
		}
		return model.LoginUser{}, appErrors.New(appErrors.CodeInternal, "erreur critique lors de l'authentification", err)
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
		return false, "", appErrors.New(appErrors.CodeInternal, "erreur de vérification des doublons", err)
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

	if err != nil {
		return appErrors.New(appErrors.CodeInternal, "impossible d'enregistrer le nouvel utilisateur", err)
	}
	return nil
}
