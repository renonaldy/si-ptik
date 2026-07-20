package challenge

import "time"

// Point is a reusable {icon, judul, keterangan} item used by the Tema, Aturan,
// Penilaian, and Hadiah section lists on the challenge detail (landing-page
// style) page.
type Point struct {
	Icon       string `json:"icon"`
	Judul      string `json:"judul"`
	Keterangan string `json:"keterangan"`
}

// Challenge — a competition/challenge listing for the public site, editable
// from the admin panel (poster/lampiran are uploaded files; link_daftar is
// an optional external registration or info link). Tema/Aturan/Penilaian/Hadiah
// are admin-authored section lists rendered as a landing page on the detail view.
type Challenge struct {
	ID              string    `json:"id"`
	Judul           string    `json:"judul"`
	Deskripsi       string    `json:"deskripsi"`
	Poster          string    `json:"poster"`
	Lampiran        string    `json:"lampiran"`
	LinkDaftar      string    `json:"link_daftar"`
	TanggalMulai    string    `json:"tanggal_mulai"`
	TanggalSelesai  string    `json:"tanggal_selesai"`
	Status          string    `json:"status"`
	TemaSubjudul    string    `json:"tema_subjudul"`
	Tema            []Point   `json:"tema"`
	Aturan          []Point   `json:"aturan"`
	Penilaian       []Point   `json:"penilaian"`
	PenilaianIntro  string    `json:"penilaian_intro"`
	Hadiah          []Point   `json:"hadiah"`
	HadiahIntro     string    `json:"hadiah_intro"`
	Hashtags        []string  `json:"hashtags"`
	CaptionTemplate string    `json:"caption_template"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Judul           string   `json:"judul"`
	Deskripsi       string   `json:"deskripsi"`
	Poster          string   `json:"poster"`
	Lampiran        string   `json:"lampiran"`
	LinkDaftar      string   `json:"link_daftar"`
	TanggalMulai    string   `json:"tanggal_mulai"`
	TanggalSelesai  string   `json:"tanggal_selesai"`
	Status          string   `json:"status"`
	TemaSubjudul    string   `json:"tema_subjudul"`
	Tema            []Point  `json:"tema"`
	Aturan          []Point  `json:"aturan"`
	Penilaian       []Point  `json:"penilaian"`
	PenilaianIntro  string   `json:"penilaian_intro"`
	Hadiah          []Point  `json:"hadiah"`
	HadiahIntro     string   `json:"hadiah_intro"`
	Hashtags        []string `json:"hashtags"`
	CaptionTemplate string   `json:"caption_template"`
}
