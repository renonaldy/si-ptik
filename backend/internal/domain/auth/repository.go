package auth

import (
	"context"
	"time"
)

// RefreshTokenRepository persists opaque refresh tokens (stored hashed) so they
// can be rotated on refresh and revoked on logout.
type RefreshTokenRepository interface {
	Store(ctx context.Context, id, userID, tokenHash string, expiresAt time.Time) error
	// FindValidUserID returns the owning user id for a non-revoked, non-expired token.
	FindValidUserID(ctx context.Context, tokenHash string) (userID string, found bool, err error)
	Revoke(ctx context.Context, tokenHash string) error
}
