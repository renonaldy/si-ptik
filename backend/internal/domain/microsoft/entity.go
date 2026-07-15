package microsoft

import "time"

// Registration status values.
const (
	StatusPending  = "pending"
	StatusApproved = "approved"
	StatusRejected = "rejected"
)

// Microsoft — a public "Pelatihan Microsoft" registration awaiting admin approval.
type Microsoft struct {
	ID              string    `json:"id"`
	Nama            string    `json:"nama"`
	NPM             string    `json:"npm"`
	JenisPelatihan  string    `json:"jenis_pelatihan"`
	BuktiPembayaran string    `json:"bukti_pembayaran"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update. Status is NOT here — it is
// changed only through the approval endpoint so a public submitter can't set it.
type Input struct {
	Nama            string `json:"nama"`
	NPM             string `json:"npm"`
	JenisPelatihan  string `json:"jenis_pelatihan"`
	BuktiPembayaran string `json:"bukti_pembayaran"`
}

// PublicView is the privacy-safe projection shown on the public training page. The
// NPM is masked (see maskNPM) and bukti_pembayaran (payment proof) is omitted so no
// sensitive data leaks through the no-auth endpoint.
type PublicView struct {
	ID             string    `json:"id"`
	Nama           string    `json:"nama"`
	NPM            string    `json:"npm"` // masked, e.g. "2021****23"
	JenisPelatihan string    `json:"jenis_pelatihan"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
}
