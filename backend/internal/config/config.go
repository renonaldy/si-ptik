package config

import (
	"fmt"
	"os"
	"strings"
	"time"
)

type Config struct {
	Port string

	DatabaseURL string

	JWTSecret       string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration

	AllowedOrigins []string

	UploadDir     string // local dir where uploaded files are written
	PublicBaseURL string // absolute base for returned file URLs (empty = derive from request)
}

// Load reads config from env and validates required fields. Fail fast at startup.
func Load() (*Config, error) {
	cfg := &Config{
		Port:            getEnv("PORT", "8080"),
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		JWTSecret:       os.Getenv("JWT_SECRET"),
		AccessTokenTTL:  getEnvDuration("ACCESS_TOKEN_TTL", 24*time.Hour),
		RefreshTokenTTL: getEnvDuration("REFRESH_TOKEN_TTL", 14*24*time.Hour),
		AllowedOrigins:  getEnvList("CORS_ALLOWED_ORIGINS", []string{"http://localhost:8080"}),
		UploadDir:       getEnv("UPLOAD_DIR", "storage/uploads"),
		PublicBaseURL:   os.Getenv("PUBLIC_BASE_URL"),
	}

	var missing []string
	if cfg.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if cfg.JWTSecret == "" {
		missing = append(missing, "JWT_SECRET")
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("config: missing required env vars: %v", missing)
	}
	if len(cfg.JWTSecret) < 32 {
		return nil, fmt.Errorf("config: JWT_SECRET must be at least 32 characters")
	}
	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// getEnvDuration parses a Go duration string (e.g. "24h", "336h"). No day unit — use hours.
func getEnvDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}

func getEnvList(key string, fallback []string) []string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	if len(out) == 0 {
		return fallback
	}
	return out
}
