package sumbangan

import "time"

// Sumbangan — ported from the Laravel `sumbangans` table.
type Sumbangan struct {
	ID         string    `json:"id"`
	NamaAlumni string    `json:"nama_alumni"`
	NPM        string    `json:"npm"`
	Sumbangan  string    `json:"sumbangan"`
	Jumlah     string    `json:"jumlah"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	NamaAlumni string `json:"nama_alumni"`
	NPM        string `json:"npm"`
	Sumbangan  string `json:"sumbangan"`
	Jumlah     string `json:"jumlah"`
}
