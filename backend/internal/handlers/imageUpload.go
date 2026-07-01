package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// maxImageSize est la taille maximale autorisée pour une image de post ou de commentaire (1 Mo).
const maxImageSize = 1 << 20

// extensionsByContentType restreint les images acceptées aux formats web courants.
var extensionsByContentType = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/gif":  ".gif",
	"image/webp": ".webp",
}

// saveUploadedImage lit un fichier optionnel du champ formField, vérifie sa taille et son
// type, puis l'enregistre sur disque dans public/images/<subDir>/. Elle retourne le chemin
// public de l'image ("" si aucun fichier n'a été fourni) ou une erreur destinée à l'utilisateur.
func saveUploadedImage(r *http.Request, formField, subDir string, authorID int) (string, error) {
	file, header, err := r.FormFile(formField)
	if err != nil {
		if err == http.ErrMissingFile {
			return "", nil
		}
		return "", fmt.Errorf("erreur lecture image")
	}
	defer file.Close()

	if header.Size > maxImageSize {
		return "", fmt.Errorf("l'image dépasse la taille maximale de 1 Mo")
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("erreur lecture fichier")
	}
	if len(fileBytes) > maxImageSize {
		return "", fmt.Errorf("l'image dépasse la taille maximale de 1 Mo")
	}

	sniffLen := 512
	if len(fileBytes) < sniffLen {
		sniffLen = len(fileBytes)
	}
	contentType := http.DetectContentType(fileBytes[:sniffLen])
	ext, ok := extensionsByContentType[contentType]
	if !ok {
		return "", fmt.Errorf("format d'image non supporté")
	}

	uploadDir := "../public/images/" + subDir + "/"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("erreur sauvegarde fichier")
	}

	filename := fmt.Sprintf("%d_%d%s", authorID, time.Now().UnixNano(), ext)
	savePath := uploadDir + filename
	if err := os.WriteFile(savePath, fileBytes, 0644); err != nil {
		return "", fmt.Errorf("erreur sauvegarde fichier")
	}

	return "/images/" + subDir + "/" + filename, nil
}
