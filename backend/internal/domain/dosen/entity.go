package dosen

import "time"

// Dosen (lecturer) — ported from the Laravel `dosens` table. Field names mirror
// the original mass-assigned columns so existing data maps 1:1.
type Dosen struct {
	ID            string    `json:"id"`
	NamaDosen     string    `json:"nama_dosen"`
	NIK           string    `json:"nik"`
	NIDN          string    `json:"nidn"`
	NoHP          string    `json:"no_hp"`
	Jabatan       string    `json:"jabatan"`
	Pangkat       string    `json:"pangkat"`
	NoSertifikasi string    `json:"no_sertifikasi"`
	Status        string    `json:"status"`
	Foto          string    `json:"foto"`
	TempatLahir   string    `json:"tempat"`  // "tempat lahir"
	TanggalLahir  string    `json:"tanggal"` // ISO date string (YYYY-MM-DD)
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	NamaDosen     string `json:"nama_dosen"`
	NIK           string `json:"nik"`
	NIDN          string `json:"nidn"`
	NoHP          string `json:"no_hp"`
	Jabatan       string `json:"jabatan"`
	Pangkat       string `json:"pangkat"`
	NoSertifikasi string `json:"no_sertifikasi"`
	Status        string `json:"status"`
	Foto          string `json:"foto"`
	TempatLahir   string `json:"tempat"`
	TanggalLahir  string `json:"tanggal"`
}
