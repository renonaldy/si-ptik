package menuaccess

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

// ConfigurableRoles are the only roles whose sidebar can be tuned. Admin roles
// always see everything, so configuring them would be meaningless (and unsafe).
var ConfigurableRoles = map[string]bool{"dosen": true, "mahasiswa": true}

func (s *Service) List(ctx context.Context) ([]RoleMenu, error) {
	return s.repo.List(ctx)
}

// SetMany upserts the menu + write lists for one or more configurable roles.
func (s *Service) SetMany(ctx context.Context, items []Item) error {
	for _, it := range items {
		role := strings.TrimSpace(it.Role)
		if !ConfigurableRoles[role] {
			return apperror.New(apperror.CodeValidation, "role tidak dapat dikonfigurasi: "+it.Role)
		}
		menuKeys := dedupe(it.MenuKeys)
		// A role can only write to menus it can also see: write ⊆ view.
		writeKeys := intersect(dedupe(it.WriteKeys), menuKeys)
		if err := s.repo.Upsert(ctx, role, menuKeys, writeKeys); err != nil {
			return fmt.Errorf("menuaccess.Service.SetMany: %w", err)
		}
	}
	return nil
}

// CanWrite reports whether a configurable role may CRUD the given menu key.
// (Admin roles are handled by the caller and never reach here.)
func (s *Service) CanWrite(ctx context.Context, role, menuKey string) (bool, error) {
	if !ConfigurableRoles[role] {
		return false, nil
	}
	rm, err := s.repo.Get(ctx, role)
	if err != nil {
		return false, fmt.Errorf("menuaccess.Service.CanWrite: %w", err)
	}
	if rm == nil {
		return false, nil
	}
	return contains(rm.WriteKeys, menuKey), nil
}

// HasAnyWrite reports whether a configurable role may CRUD at least one menu
// (used to allow shared endpoints like file upload).
func (s *Service) HasAnyWrite(ctx context.Context, role string) (bool, error) {
	if !ConfigurableRoles[role] {
		return false, nil
	}
	rm, err := s.repo.Get(ctx, role)
	if err != nil {
		return false, fmt.Errorf("menuaccess.Service.HasAnyWrite: %w", err)
	}
	return rm != nil && len(rm.WriteKeys) > 0, nil
}

// dedupe trims blanks and removes duplicate keys while preserving order. Always
// returns a non-nil slice so it serializes as [] and stores as an empty JSON array.
func dedupe(in []string) []string {
	seen := make(map[string]bool, len(in))
	out := []string{}
	for _, k := range in {
		k = strings.TrimSpace(k)
		if k == "" || seen[k] {
			continue
		}
		seen[k] = true
		out = append(out, k)
	}
	return out
}

// intersect returns the items of `in` that also appear in `allow`, preserving order.
func intersect(in, allow []string) []string {
	set := make(map[string]bool, len(allow))
	for _, a := range allow {
		set[a] = true
	}
	out := []string{}
	for _, k := range in {
		if set[k] {
			out = append(out, k)
		}
	}
	return out
}

func contains(list []string, want string) bool {
	for _, k := range list {
		if k == want {
			return true
		}
	}
	return false
}
