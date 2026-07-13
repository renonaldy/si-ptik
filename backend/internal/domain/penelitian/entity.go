package penelitian

import "time"

// Penelitian — ported from the Laravel `penelitians` table.
type Penelitian struct {
	ID              string    `json:"id"`
	NamaPenelitian  string    `json:"nama_penelitian"`
	JenisPenelitian string    `json:"jenis_penelitian"`
	Author          string    `json:"author"`
	Tanggal         string    `json:"tanggal"`
	File            string    `json:"file"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	NamaPenelitian  string `json:"nama_penelitian"`
	JenisPenelitian string `json:"jenis_penelitian"`
	Author          string `json:"author"`
	Tanggal         string `json:"tanggal"`
	File            string `json:"file"`
}
