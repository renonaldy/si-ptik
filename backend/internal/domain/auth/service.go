package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"ptik/internal/domain/user"
	"ptik/pkg/apperror"
	"ptik/pkg/jwtutil"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	users           user.Repository
	tokens          RefreshTokenRepository
	jwt             *jwtutil.JWT
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
}

func NewService(users user.Repository, tokens RefreshTokenRepository, jwt *jwtutil.JWT, accessTTL, refreshTTL time.Duration) *Service {
	return &Service{users: users, tokens: tokens, jwt: jwt, accessTokenTTL: accessTTL, refreshTokenTTL: refreshTTL}
}

// Login validates credentials and issues a fresh token pair. The identifier is
// an email (admin/dosen) or an NPM (mahasiswa); lowercasing digits is a no-op,
// so a single lookup handles both.
func (s *Service) Login(ctx context.Context, identifier, password string) (*TokenPair, error) {
	identifier = strings.ToLower(strings.TrimSpace(identifier))
	if identifier == "" || password == "" {
		return nil, apperror.New(apperror.CodeValidation, "email/NPM dan password wajib diisi")
	}

	u, err := s.users.GetByEmail(ctx, identifier)
	if err != nil {
		return nil, fmt.Errorf("auth.Service.Login: %w", err)
	}
	// Same error for unknown-identifier and wrong-password (avoid user enumeration).
	if u == nil || bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) != nil {
		return nil, apperror.New(apperror.CodeUnauthorized, "email/NPM atau password salah")
	}

	return s.issuePair(ctx, u.ID, u.Role)
}

// Refresh validates + rotates a refresh token and issues a new pair.
func (s *Service) Refresh(ctx context.Context, refreshToken string) (*TokenPair, error) {
	hash := hashToken(refreshToken)
	userID, found, err := s.tokens.FindValidUserID(ctx, hash)
	if err != nil {
		return nil, fmt.Errorf("auth.Service.Refresh: %w", err)
	}
	if !found {
		return nil, apperror.New(apperror.CodeUnauthorized, "sesi tidak valid, silakan login ulang")
	}
	u, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("auth.Service.Refresh: %w", err)
	}
	if u == nil {
		return nil, apperror.New(apperror.CodeUnauthorized, "akun tidak ditemukan")
	}
	// Rotate: revoke the used token, then mint a new pair.
	if err := s.tokens.Revoke(ctx, hash); err != nil {
		return nil, fmt.Errorf("auth.Service.Refresh revoke: %w", err)
	}
	return s.issuePair(ctx, u.ID, u.Role)
}

// Logout revokes the given refresh token (best-effort).
func (s *Service) Logout(ctx context.Context, refreshToken string) error {
	if strings.TrimSpace(refreshToken) == "" {
		return nil
	}
	if err := s.tokens.Revoke(ctx, hashToken(refreshToken)); err != nil {
		return fmt.Errorf("auth.Service.Logout: %w", err)
	}
	return nil
}

func (s *Service) issuePair(ctx context.Context, userID, role string) (*TokenPair, error) {
	access, err := s.jwt.SignAccess(userID, role)
	if err != nil {
		return nil, fmt.Errorf("auth.Service.issuePair access: %w", err)
	}
	// Opaque, high-entropy refresh token; only its hash is persisted.
	refresh := uuid.NewString() + uuid.NewString()
	if err := s.tokens.Store(ctx, uuid.NewString(), userID, hashToken(refresh), time.Now().UTC().Add(s.refreshTokenTTL)); err != nil {
		return nil, fmt.Errorf("auth.Service.issuePair store: %w", err)
	}
	return &TokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresIn:    int64(s.accessTokenTTL.Seconds()),
	}, nil
}

func hashToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}
