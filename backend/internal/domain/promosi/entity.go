package promosi

import "time"

// Tipe values.
const (
	TipeFlyer = "flyer"
	TipeVideo = "video"
)

// Sumber values — where the media URL points to. Flyers allow upload/gdrive;
// videos allow upload/youtube/gdrive.
const (
	SumberUpload  = "upload"
	SumberYouTube = "youtube"
	SumberGDrive  = "gdrive"
)

// Promosi — promotional content (flyer image or video) for the public site.
type Promosi struct {
	ID         string    `json:"id"`
	Judul      string    `json:"judul"`
	Tipe       string    `json:"tipe"`   // "flyer" | "video"
	Media      string    `json:"media"`  // image/video URL, or a YouTube/GDrive link
	Sumber     string    `json:"sumber"` // "upload" | "youtube" (video only) | "gdrive"
	Keterangan string    `json:"keterangan"`
	Tanggal    string    `json:"tanggal"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Judul      string `json:"judul"`
	Tipe       string `json:"tipe"`
	Media      string `json:"media"`
	Sumber     string `json:"sumber"`
	Keterangan string `json:"keterangan"`
	Tanggal    string `json:"tanggal"`
}
