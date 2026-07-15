package user

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

// Role constants — the four roles the system understands.
const (
	RoleSuperAdmin = "super_admin"
	RoleAdmin      = "admin"
	RoleDosen      = "dosen"
	RoleMahasiswa  = "mahasiswa"
)

var validRoles = map[string]bool{
	RoleSuperAdmin: true,
	RoleAdmin:      true,
	RoleDosen:      true,
	RoleMahasiswa:  true,
}

const minPasswordLen = 8

// npmPattern matches a student NPM: digits only, reasonable length (e.g. 1810013231009).
var npmPattern = regexp.MustCompile(`^\d{5,20}$`)

// normalizeIdentifier validates and normalizes the login identifier for a role.
// Mahasiswa log in with their NPM (digits only); every other role uses an email.
func normalizeIdentifier(role, raw string) (string, error) {
	v := strings.TrimSpace(raw)
	if role == RoleMahasiswa {
		if !npmPattern.MatchString(v) {
			return "", apperror.New(apperror.CodeValidation, "NPM tidak valid (hanya angka, 5–20 digit)")
		}
		return v, nil
	}
	v = strings.ToLower(v)
	if v == "" || !strings.Contains(v, "@") {
		return "", apperror.New(apperror.CodeValidation, "email tidak valid")
	}
	return v, nil
}

// canAssign reports whether an actor with actorRole may create/assign a target
// with targetRole. super_admin may assign anything; admin may only manage the
// two lower roles (dosen, mahasiswa); nobody else manages accounts.
func canAssign(actorRole, targetRole string) bool {
	switch actorRole {
	case RoleSuperAdmin:
		return true
	case RoleAdmin:
		return targetRole == RoleDosen || targetRole == RoleMahasiswa
	default:
		return false
	}
}

// GetByID returns the user or a NOT_FOUND app error.
func (s *Service) GetByID(ctx context.Context, id string) (*User, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("user.Service.GetByID: %w", err)
	}
	if u == nil {
		return nil, apperror.New(apperror.CodeNotFound, "user not found")
	}
	return u, nil
}

func (s *Service) List(ctx context.Context, search string) ([]User, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

// Create makes a new account. actorRole gates which target roles are allowed.
func (s *Service) Create(ctx context.Context, actorRole string, in CreateInput) (*User, error) {
	name := strings.TrimSpace(in.FullName)
	role := strings.TrimSpace(in.Role)

	if name == "" {
		return nil, apperror.New(apperror.CodeValidation, "nama lengkap wajib diisi")
	}
	if !validRoles[role] {
		return nil, apperror.New(apperror.CodeValidation, "role tidak valid")
	}
	// Login identifier: NPM for mahasiswa, email for everyone else.
	identifier, err := normalizeIdentifier(role, in.Email)
	if err != nil {
		return nil, err
	}
	if len(in.Password) < minPasswordLen {
		return nil, apperror.New(apperror.CodeValidation, fmt.Sprintf("password minimal %d karakter", minPasswordLen))
	}
	if !canAssign(actorRole, role) {
		return nil, apperror.New(apperror.CodeForbidden, "Anda tidak berhak membuat akun dengan role tersebut")
	}

	existing, err := s.repo.GetByEmail(ctx, identifier)
	if err != nil {
		return nil, fmt.Errorf("user.Service.Create: %w", err)
	}
	if existing != nil {
		return nil, apperror.New(apperror.CodeConflict, "email/NPM sudah digunakan")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("user.Service.Create hash: %w", err)
	}
	u := &User{
		ID:           "user-" + uuid.NewString(),
		Email:        identifier,
		PasswordHash: string(hash),
		FullName:     name,
		Role:         role,
	}
	if err := s.repo.Create(ctx, u); err != nil {
		return nil, fmt.Errorf("user.Service.Create: %w", err)
	}
	// Return the freshly-stored row (populates timestamps).
	created, err := s.repo.GetByID(ctx, u.ID)
	if err != nil {
		return nil, fmt.Errorf("user.Service.Create reload: %w", err)
	}
	return created, nil
}

// Update changes an account's name/role. The actor must be allowed to manage
// BOTH the existing role and the new role.
func (s *Service) Update(ctx context.Context, actorRole, id string, in UpdateInput) (*User, error) {
	name := strings.TrimSpace(in.FullName)
	role := strings.TrimSpace(in.Role)
	if name == "" {
		return nil, apperror.New(apperror.CodeValidation, "nama lengkap wajib diisi")
	}
	if !validRoles[role] {
		return nil, apperror.New(apperror.CodeValidation, "role tidak valid")
	}
	// Login identifier follows the (possibly new) role: NPM for mahasiswa, email otherwise.
	identifier, err := normalizeIdentifier(role, in.Email)
	if err != nil {
		return nil, err
	}

	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("user.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "akun tidak ditemukan")
	}
	if !canAssign(actorRole, existing.Role) || !canAssign(actorRole, role) {
		return nil, apperror.New(apperror.CodeForbidden, "Anda tidak berhak mengubah akun ini")
	}

	// If the identifier is being changed, make sure it isn't already taken by
	// another account (matching your own current identifier is fine).
	if identifier != existing.Email {
		taken, err := s.repo.GetByEmail(ctx, identifier)
		if err != nil {
			return nil, fmt.Errorf("user.Service.Update: %w", err)
		}
		if taken != nil && taken.ID != id {
			return nil, apperror.New(apperror.CodeConflict, "email/NPM sudah digunakan")
		}
	}

	u, err := s.repo.Update(ctx, id, identifier, name, role)
	if err != nil {
		return nil, fmt.Errorf("user.Service.Update: %w", err)
	}
	return u, nil
}

// ResetPassword sets a new password for an account (admin-driven reset).
func (s *Service) ResetPassword(ctx context.Context, actorRole, id, password string) error {
	if len(password) < minPasswordLen {
		return apperror.New(apperror.CodeValidation, fmt.Sprintf("password minimal %d karakter", minPasswordLen))
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("user.Service.ResetPassword: %w", err)
	}
	if existing == nil {
		return apperror.New(apperror.CodeNotFound, "akun tidak ditemukan")
	}
	if !canAssign(actorRole, existing.Role) {
		return apperror.New(apperror.CodeForbidden, "Anda tidak berhak mengubah akun ini")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("user.Service.ResetPassword hash: %w", err)
	}
	if err := s.repo.UpdatePassword(ctx, id, string(hash)); err != nil {
		return fmt.Errorf("user.Service.ResetPassword: %w", err)
	}
	return nil
}

// Delete removes an account. Actors cannot delete themselves or accounts they
// are not allowed to manage.
func (s *Service) Delete(ctx context.Context, actorRole, actorID, id string) error {
	if actorID == id {
		return apperror.New(apperror.CodeValidation, "Anda tidak dapat menghapus akun sendiri")
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("user.Service.Delete: %w", err)
	}
	if existing == nil {
		return apperror.New(apperror.CodeNotFound, "akun tidak ditemukan")
	}
	if !canAssign(actorRole, existing.Role) {
		return apperror.New(apperror.CodeForbidden, "Anda tidak berhak menghapus akun ini")
	}
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("user.Service.Delete: %w", err)
	}
	return nil
}
