package navmenu

import "time"

const (
	TypeLink     = "link"
	TypeDropdown = "dropdown"
)

// NavLeaf is a dropdown's child entry (only meaningful when NavItem.Type is
// TypeDropdown).
type NavLeaf struct {
	Label    string `json:"label"`
	To       string `json:"to"`
	External bool   `json:"external"`
}

// NavItem is one top-level entry in the public navbar, editable from the
// admin panel. Path is the route for TypeLink, or the active-highlight
// prefix ("base") for TypeDropdown; Items/External are only meaningful for
// their respective type.
type NavItem struct {
	ID         string    `json:"id"`
	Type       string    `json:"type"`
	Label      string    `json:"label"`
	Path       string    `json:"path"`
	External   bool      `json:"external"`
	Items      []NavLeaf `json:"items"`
	OrderIndex int       `json:"order_index"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Type     string    `json:"type"`
	Label    string    `json:"label"`
	Path     string    `json:"path"`
	External bool      `json:"external"`
	Items    []NavLeaf `json:"items"`
}
