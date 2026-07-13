package ujian

import "time"

// Ujian is a scheduled exam entry for a student. `jenis` is "sempro" | "kompre";
// `status` is "akan" | "sedang" | "sudah".
type Ujian struct {
	ID          string    `json:"id"`
	Nama        string    `json:"nama"`
	NPM         string    `json:"npm"`
	Jenis       string    `json:"jenis"`
	Judul       string    `json:"judul"`
	Pembimbing  string    `json:"pembimbing"`
	Penguji1    string    `json:"penguji1"`
	Penguji2    string    `json:"penguji2"`
	Tanggal     string    `json:"tanggal"`
	Jam         string    `json:"jam"`
	JamSelesai  string    `json:"jam_selesai"`
	Ruang       string    `json:"ruang"`
	Status      string    `json:"status"`
	Foto        string    `json:"foto"`
	FileSkripsi string    `json:"file_skripsi"`
	FilePPT     string    `json:"file_ppt"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Input struct {
	Nama        string `json:"nama"`
	NPM         string `json:"npm"`
	Jenis       string `json:"jenis"`
	Judul       string `json:"judul"`
	Pembimbing  string `json:"pembimbing"`
	Penguji1    string `json:"penguji1"`
	Penguji2    string `json:"penguji2"`
	Tanggal     string `json:"tanggal"`
	Jam         string `json:"jam"`
	JamSelesai  string `json:"jam_selesai"`
	Ruang       string `json:"ruang"`
	Status      string `json:"status"`
	Foto        string `json:"foto"`
	FileSkripsi string `json:"file_skripsi"`
	FilePPT     string `json:"file_ppt"`
}
