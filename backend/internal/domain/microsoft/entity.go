package microsoft

import "time"

// Microsoft — ported from the Laravel `microsofts` table.
type Microsoft struct {
	ID               string    `json:"id"`
	Nama             string    `json:"nama"`
	Email            string    `json:"email"`
	JenisPelatihan   string    `json:"jenis_pelatihan"`
	TanggalPelatihan string    `json:"tanggal_pelatihan"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Nama             string `json:"nama"`
	Email            string `json:"email"`
	JenisPelatihan   string `json:"jenis_pelatihan"`
	TanggalPelatihan string `json:"tanggal_pelatihan"`
}
