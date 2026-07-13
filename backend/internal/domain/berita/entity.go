package berita

import "time"

// Berita — ported/added for the public site.
type Berita struct {
	ID        string    `json:"id"`
	Judul     string    `json:"judul"`
	Ringkasan string    `json:"ringkasan"`
	Konten    string    `json:"konten"`
	Gambar    string    `json:"gambar"`
	Penulis   string    `json:"penulis"`
	Tanggal   string    `json:"tanggal"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Judul     string `json:"judul"`
	Ringkasan string `json:"ringkasan"`
	Konten    string `json:"konten"`
	Gambar    string `json:"gambar"`
	Penulis   string `json:"penulis"`
	Tanggal   string `json:"tanggal"`
}
