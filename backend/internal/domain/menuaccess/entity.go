package menuaccess

import "time"

// UserMenu is the set of sidebar menu keys one account may see, plus the subset
// it may also write to (CREATE/UPDATE/DELETE). Only configurable accounts
// (dosen, mahasiswa) are stored here — super_admin and admin always see and
// manage every menu.
type UserMenu struct {
	UserID    string    `json:"user_id"`
	MenuKeys  []string  `json:"menu_keys"`  // visible menus
	WriteKeys []string  `json:"write_keys"` // menus this account may CRUD (subset of MenuKeys)
	UpdatedAt time.Time `json:"updated_at"`
}

// Item is the writable payload for one account (create/update).
type Item struct {
	UserID    string   `json:"user_id"`
	MenuKeys  []string `json:"menu_keys"`
	WriteKeys []string `json:"write_keys"`
}
