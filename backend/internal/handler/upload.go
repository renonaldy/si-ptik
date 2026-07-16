package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"ptik/pkg/apperror"
	"ptik/pkg/response"

	"github.com/google/uuid"
)

// UploadHandler stores a single uploaded file on local disk and returns its URL.
type UploadHandler struct {
	dir           string
	publicBaseURL string
}

func NewUploadHandler(dir, publicBaseURL string) *UploadHandler {
	_ = os.MkdirAll(dir, 0o755)
	return &UploadHandler{dir: dir, publicBaseURL: publicBaseURL}
}

const (
	maxUploadBytes      = 10 << 20  // 10 MiB — documents & images
	maxVideoUploadBytes = 100 << 20 // 100 MiB — promotional videos (authenticated only)
)

var allowedExt = map[string]bool{
	".pdf": true, ".png": true, ".jpg": true, ".jpeg": true, ".webp": true,
	".doc": true, ".docx": true, ".ppt": true, ".pptx": true,
}

// Video uploads get a larger cap but are only accepted on the authenticated
// endpoint (allowVideo), never on the public one.
var allowedVideoExt = map[string]bool{
	".mp4": true, ".webm": true, ".mov": true, ".m4v": true,
}

type uploadResult struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
}

func (h *UploadHandler) Upload(allowVideo bool) http.HandlerFunc {
	bodyLimit := int64(maxUploadBytes)
	if allowVideo {
		bodyLimit = maxVideoUploadBytes
	}
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, bodyLimit+(1<<20)) // + multipart overhead
		if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
			response.Error(w, apperror.New(apperror.CodeValidation,
				fmt.Sprintf("file terlalu besar atau tidak valid (maks %dMB)", bodyLimit>>20)))
			return
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			response.Error(w, apperror.New(apperror.CodeValidation, "field 'file' wajib ada"))
			return
		}
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		limit := int64(maxUploadBytes)
		switch {
		case allowedVideoExt[ext]:
			if !allowVideo {
				response.Error(w, apperror.New(apperror.CodeValidation, "tipe file tidak diizinkan"))
				return
			}
			limit = maxVideoUploadBytes
		case allowedExt[ext]:
		default:
			response.Error(w, apperror.New(apperror.CodeValidation, "tipe file tidak diizinkan"))
			return
		}
		if header.Size > limit {
			response.Error(w, apperror.New(apperror.CodeValidation,
				fmt.Sprintf("file terlalu besar (maks %dMB untuk %s)", limit>>20, ext)))
			return
		}

		name := uuid.NewString() + ext
		dst, err := os.Create(filepath.Join(h.dir, name))
		if err != nil {
			response.Error(w, apperror.Internal("gagal menyimpan file", err))
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			response.Error(w, apperror.Internal("gagal menulis file", err))
			return
		}

		base := h.publicBaseURL
		if base == "" {
			scheme := "http"
			if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
				scheme = "https"
			}
			base = fmt.Sprintf("%s://%s", scheme, r.Host)
		}
		base = strings.TrimRight(base, "/")

		response.JSON(w, http.StatusCreated, uploadResult{
			URL:      base + "/uploads/" + name,
			Filename: header.Filename,
		})
	}
}
