package jwtutil

import (
	"fmt"
	"time"

	"ptik/pkg/apperror"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"uid"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type Config struct {
	Secret          []byte
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

type JWT struct{ cfg Config }

func New(cfg Config) *JWT { return &JWT{cfg: cfg} }

// SignAccess mints a short-lived access token carrying the user id + role.
func (j *JWT) SignAccess(userID, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(j.cfg.AccessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(j.cfg.Secret)
	if err != nil {
		return "", fmt.Errorf("jwtutil.SignAccess: %w", err)
	}
	return signed, nil
}

// Validate parses and verifies an access token.
func (j *JWT) Validate(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return j.cfg.Secret, nil
	})
	if err != nil || !token.Valid {
		return nil, apperror.New(apperror.CodeUnauthorized, "invalid or expired token")
	}
	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, apperror.New(apperror.CodeUnauthorized, "invalid token claims")
	}
	return claims, nil
}
