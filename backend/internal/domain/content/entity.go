package content

import "time"

// SiteContent is a single editable content block, addressed by a stable key
// (e.g. "home_hero_title", "visi", "kontak_email").
type SiteContent struct {
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Item is a key/value pair for bulk updates.
type Item struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
