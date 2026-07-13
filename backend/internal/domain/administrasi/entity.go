package administrasi

import "time"

// Administrasi — ported from the Laravel `administrasis` table.
type Administrasi struct {
	ID        string    `json:"id"`
	Nama      string    `json:"nama"`
	NPM       string    `json:"npm"`
	Kategori  string    `json:"kategori"`
	File      string    `json:"file"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Nama     string `json:"nama"`
	NPM      string `json:"npm"`
	Kategori string `json:"kategori"`
	File     string `json:"file"`
}
