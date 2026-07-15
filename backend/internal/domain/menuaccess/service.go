package menuaccess

import (
	"context"
	"fmt"
	"strings"

	"ptik/internal/domain/user"
	"ptik/pkg/apperror"
)

// Users is the minimal user-lookup the service needs to validate that a target
// account exists and is a configurable role. Satisfied by *user.Repository
// (same decoupling pattern auth.Service uses).
type Users interface {
	GetByID(ctx context.Context, id string) (*user.User, error)
}

type Service struct {
	repo  Repository
	users Users
}

func NewService(repo Repository, users Users) *Service {
	return &Service{repo: repo, users: users}
}

// ConfigurableRoles are the only roles whose sidebar can be tuned. Admin roles
// always see everything, so configuring them would be meaningless (and unsafe).
var ConfigurableRoles = map[string]bool{user.RoleDosen: true, user.RoleMahasiswa: true}

func (s *Service) List(ctx context.Context) ([]UserMenu, error) {
	return s.repo.List(ctx)
}

// Get returns one account's menu config (nil if none stored yet).
func (s *Service) Get(ctx context.Context, userID string) (*UserMenu, error) {
	return s.repo.Get(ctx, userID)
}

// SetMany upserts the menu + write lists for one or more configurable accounts.
func (s *Service) SetMany(ctx context.Context, items []Item) error {
	for _, it := range items {
		userID := strings.TrimSpace(it.UserID)
		if userID == "" {
			return apperror.New(apperror.CodeValidation, "user_id wajib diisi")
		}
		u, err := s.users.GetByID(ctx, userID)
		if err != nil {
			return fmt.Errorf("menuaccess.Service.SetMany: %w", err)
		}
		if u == nil {
			return apperror.New(apperror.CodeNotFound, "akun tidak ditemukan")
		}
		if !ConfigurableRoles[u.Role] {
			return apperror.New(apperror.CodeValidation, "akun ini tidak dapat dikonfigurasi (hanya dosen & mahasiswa)")
		}
		menuKeys := dedupe(it.MenuKeys)
		// An account can only write to menus it can also see: write ⊆ view.
		writeKeys := intersect(dedupe(it.WriteKeys), menuKeys)
		if err := s.repo.Upsert(ctx, userID, menuKeys, writeKeys); err != nil {
			return fmt.Errorf("menuaccess.Service.SetMany: %w", err)
		}
	}
	return nil
}

// CanWrite reports whether the given account may CRUD the given menu key.
// (Admin roles are handled by the caller and never reach here.)
func (s *Service) CanWrite(ctx context.Context, userID, menuKey string) (bool, error) {
	if strings.TrimSpace(userID) == "" {
		return false, nil
	}
	um, err := s.repo.Get(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("menuaccess.Service.CanWrite: %w", err)
	}
	if um == nil {
		return false, nil
	}
	return contains(um.WriteKeys, menuKey), nil
}

// HasAnyWrite reports whether the given account may CRUD at least one menu
// (used to allow shared endpoints like file upload).
func (s *Service) HasAnyWrite(ctx context.Context, userID string) (bool, error) {
	if strings.TrimSpace(userID) == "" {
		return false, nil
	}
	um, err := s.repo.Get(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("menuaccess.Service.HasAnyWrite: %w", err)
	}
	return um != nil && len(um.WriteKeys) > 0, nil
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
