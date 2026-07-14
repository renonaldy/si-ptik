package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/dosen"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type DosenService interface {
	List(ctx context.Context, search string) ([]dosen.Dosen, error)
	Get(ctx context.Context, id string) (*dosen.Dosen, error)
	Create(ctx context.Context, in dosen.Input) (*dosen.Dosen, error)
	Update(ctx context.Context, id string, in dosen.Input) (*dosen.Dosen, error)
	Delete(ctx context.Context, id string) error
}

type DosenHandler struct{ svc DosenService }

func NewDosenHandler(svc DosenService) *DosenHandler { return &DosenHandler{svc: svc} }

func (h *DosenHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *DosenHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

// dosenPublicView exposes only non-sensitive fields for the public website.
// NIK, No. HP, No. Sertifikasi, and birth data are intentionally omitted.
type dosenPublicView struct {
	ID        string `json:"id"`
	NamaDosen string `json:"nama_dosen"`
	NIDN      string `json:"nidn"`
	Jabatan   string `json:"jabatan"`
	Pangkat   string `json:"pangkat"`
	Status    string `json:"status"`
	Foto      string `json:"foto"`
}

// PublicList — no-auth listing of lecturers with sensitive fields stripped.
func (h *DosenHandler) PublicList(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	out := make([]dosenPublicView, 0, len(list))
	for _, d := range list {
		out = append(out, dosenPublicView{
			ID:        d.ID,
			NamaDosen: d.NamaDosen,
			NIDN:      d.NIDN,
			Jabatan:   d.Jabatan,
			Pangkat:   d.Pangkat,
			Status:    d.Status,
			Foto:      d.Foto,
		})
	}
	response.JSON(w, http.StatusOK, out)
}

func (h *DosenHandler) Get(w http.ResponseWriter, r *http.Request) {
	d, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, d)
}

func (h *DosenHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in dosen.Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	d, err := h.svc.Create(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, d)
}

func (h *DosenHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in dosen.Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	d, err := h.svc.Update(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, d)
}

func (h *DosenHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
