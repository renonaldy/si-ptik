package sempro

import "time"

// Sempro — ported from the Laravel `sempros` table.
type Sempro struct {
	ID         string    `json:"id"`
	Nama       string    `json:"nama"`
	NPM        string    `json:"npm"`
	Judul      string    `json:"judul"`
	Pembimbing string    `json:"pembimbing"`
	File       string    `json:"file"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Nama       string `json:"nama"`
	NPM        string `json:"npm"`
	Judul      string `json:"judul"`
	Pembimbing string `json:"pembimbing"`
	File       string `json:"file"`
}
