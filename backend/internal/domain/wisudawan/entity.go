package wisudawan

import "time"

// Wisudawan — ported from the Laravel `wisudawans` table.
type Wisudawan struct {
	ID            string    `json:"id"`
	NamaWisudawan string    `json:"nama_wisudawan"`
	NPM           string    `json:"npm"`
	JudulSkripsi  string    `json:"judul_skripsi"`
	Pembimbing    string    `json:"pembimbing"`
	TanggalSidang string    `json:"tanggal_sidang"`
	Foto          string    `json:"foto"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	NamaWisudawan string `json:"nama_wisudawan"`
	NPM           string `json:"npm"`
	JudulSkripsi  string `json:"judul_skripsi"`
	Pembimbing    string `json:"pembimbing"`
	TanggalSidang string `json:"tanggal_sidang"`
	Foto          string `json:"foto"`
}
