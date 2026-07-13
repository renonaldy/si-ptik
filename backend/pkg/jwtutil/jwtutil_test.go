package jwtutil

import (
	"testing"
	"time"
)

func newTestJWT() *JWT {
	return New(Config{
		Secret:         []byte("01234567890123456789012345678901234567"),
		AccessTokenTTL: time.Hour,
	})
}

func TestSignAndValidate(t *testing.T) {
	j := newTestJWT()
	tok, err := j.SignAccess("user-1", "admin")
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	claims, err := j.Validate(tok)
	if err != nil {
		t.Fatalf("validate: %v", err)
	}
	if claims.UserID != "user-1" || claims.Role != "admin" {
		t.Fatalf("unexpected claims: %+v", claims)
	}
}

func TestValidate_RejectsGarbage(t *testing.T) {
	j := newTestJWT()
	if _, err := j.Validate("not.a.valid.token"); err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestValidate_RejectsWrongSecret(t *testing.T) {
	tok, _ := newTestJWT().SignAccess("user-1", "admin")
	other := New(Config{Secret: []byte("99999999999999999999999999999999999999"), AccessTokenTTL: time.Hour})
	if _, err := other.Validate(tok); err == nil {
		t.Fatal("expected error validating token signed with a different secret")
	}
}
