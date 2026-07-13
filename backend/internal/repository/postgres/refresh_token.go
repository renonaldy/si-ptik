package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RefreshTokenRepository struct{ pool *pgxpool.Pool }

func NewRefreshTokenRepository(pool *pgxpool.Pool) *RefreshTokenRepository {
	return &RefreshTokenRepository{pool: pool}
}

func (r *RefreshTokenRepository) Store(ctx context.Context, id, userID, tokenHash string, expiresAt time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
		VALUES ($1, $2, $3, $4)
	`, id, userID, tokenHash, expiresAt)
	if err != nil {
		return fmt.Errorf("RefreshTokenRepository.Store: %w", err)
	}
	return nil
}

func (r *RefreshTokenRepository) FindValidUserID(ctx context.Context, tokenHash string) (string, bool, error) {
	var userID string
	err := r.pool.QueryRow(ctx, `
		SELECT user_id FROM refresh_tokens
		WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()
	`, tokenHash).Scan(&userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", false, nil
		}
		return "", false, fmt.Errorf("RefreshTokenRepository.FindValidUserID: %w", err)
	}
	return userID, true, nil
}

func (r *RefreshTokenRepository) Revoke(ctx context.Context, tokenHash string) error {
	if _, err := r.pool.Exec(ctx, `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`, tokenHash); err != nil {
		return fmt.Errorf("RefreshTokenRepository.Revoke: %w", err)
	}
	return nil
}
