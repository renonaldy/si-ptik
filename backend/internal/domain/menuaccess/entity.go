package menuaccess

import "time"

// RoleMenu is the set of sidebar menu keys a (configurable) role may see, plus
// the subset it may also write to (CREATE/UPDATE/DELETE). super_admin and admin
// are never stored here — they always see and manage every menu.
type RoleMenu struct {
	Role      string    `json:"role"`
	MenuKeys  []string  `json:"menu_keys"`  // visible menus
	WriteKeys []string  `json:"write_keys"` // menus this role may CRUD (subset of MenuKeys)
	UpdatedAt time.Time `json:"updated_at"`
}

// Item is the writable payload for one role (create/update).
type Item struct {
	Role      string   `json:"role"`
	MenuKeys  []string `json:"menu_keys"`
	WriteKeys []string `json:"write_keys"`
}
