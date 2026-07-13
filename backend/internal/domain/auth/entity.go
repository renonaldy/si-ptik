package auth

// TokenPair is returned by login/refresh. The frontend stores both in
// localStorage and silently refreshes the access token on 401.
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"` // access-token lifetime, seconds
}
