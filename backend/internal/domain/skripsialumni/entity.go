package skripsialumni

import "time"

// SkripsiAlumni — ported from the Laravel `skripsi_alumnis` table.
type SkripsiAlumni struct {
	ID           string    `json:"id"`
	NamaAlumni   string    `json:"nama_alumni"`
	NPM          string    `json:"npm"`
	JudulSkripsi string    `json:"judul_skripsi"`
	Pembimbing   string    `json:"pembimbing"`
	File         string    `json:"file"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	NamaAlumni   string `json:"nama_alumni"`
	NPM          string `json:"npm"`
	JudulSkripsi string `json:"judul_skripsi"`
	Pembimbing   string `json:"pembimbing"`
	File         string `json:"file"`
}
