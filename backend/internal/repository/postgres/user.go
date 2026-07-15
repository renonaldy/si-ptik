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

func (r *UserRepository) List(ctx context.Context, search string) ([]user.User, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+userColumns+`
		FROM users
		WHERE ($1 = '' OR full_name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
		ORDER BY created_at DESC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("UserRepository.List: %w", err)
	}
	defer rows.Close()

	list := []user.User{}
	for rows.Next() {
		var u user.User
		if err := rows.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, fmt.Errorf("UserRepository.List scan: %w", err)
		}
		list = append(list, u)
	}
	return list, rows.Err()
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

func (r *UserRepository) Update(ctx context.Context, id, email, fullName, role string) (*user.User, error) {
	var u user.User
	err := r.pool.QueryRow(ctx, `
		UPDATE users SET email = $2, full_name = $3, role = $4 WHERE id = $1
		RETURNING `+userColumns,
		id, email, fullName, role,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("UserRepository.Update: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) UpdatePassword(ctx context.Context, id, passwordHash string) error {
	if _, err := r.pool.Exec(ctx, `UPDATE users SET password_hash = $2 WHERE id = $1`, id, passwordHash); err != nil {
		return fmt.Errorf("UserRepository.UpdatePassword: %w", err)
	}
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, id); err != nil {
		return fmt.Errorf("UserRepository.Delete: %w", err)
	}
	return nil
}
