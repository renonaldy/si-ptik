package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/user"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct{ pool *pgxpool.Pool }

func NewUserRepository(pool *pgxpool.Pool) *UserRepository { return &UserRepository{pool: pool} }

const userColumns = `id, email, password_hash, full_name, role, created_at, updated_at`

func (r *UserRepository) GetByID(ctx context.Context, id string) (*user.User, error) {
	var u user.User
	err := r.pool.QueryRow(ctx,
		`SELECT `+userColumns+` FROM users WHERE id = $1`, id,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // not-found -> (nil, nil); service maps to 404
		}
		return nil, fmt.Errorf("UserRepository.GetByID: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	var u user.User
	err := r.pool.QueryRow(ctx,
		`SELECT `+userColumns+` FROM users WHERE email = $1`, email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("UserRepository.GetByEmail: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO users (id, email, password_hash, full_name, role)
		VALUES ($1, $2, $3, $4, $5)
	`, u.ID, u.Email, u.PasswordHash, u.FullName, u.Role)
	if err != nil {
		return fmt.Errorf("UserRepository.Create: %w", err)
	}
	return nil
}
