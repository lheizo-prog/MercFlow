package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type Claims struct {
	Username string `json:"username"`
	Iat      int64  `json:"iat"`
	Exp      int64  `json:"exp"`
}

func getEnv(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func defaultAdminUsername() string {
	return getEnv("ADMIN_USERNAME", "admin")
}

func defaultAdminPassword() string {
	return getEnv("ADMIN_PASSWORD", "admin123")
}

func defaultJWTSecret() string {
	return getEnv("JWT_SECRET", "mercflow-admin-secret-key")
}

func CheckCredentials(username, password string) bool {
	return strings.EqualFold(username, defaultAdminUsername()) && password == defaultAdminPassword()
}

func GenerateToken(username string) (string, error) {
	header := map[string]string{"alg": "HS256", "typ": "JWT"}
	claims := Claims{
		Username: username,
		Iat:      time.Now().Unix(),
		Exp:      time.Now().Add(8 * time.Hour).Unix(),
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	headerB64 := base64.RawURLEncoding.EncodeToString(headerJSON)
	claimsB64 := base64.RawURLEncoding.EncodeToString(claimsJSON)
	signingInput := headerB64 + "." + claimsB64
	signature, err := signHMAC(signingInput)
	if err != nil {
		return "", err
	}

	return signingInput + "." + base64.RawURLEncoding.EncodeToString(signature), nil
}

func ValidateToken(token string) (Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return Claims{}, errors.New("token inválido")
	}

	signingInput := parts[0] + "." + parts[1]
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return Claims{}, errors.New("token inválido")
	}

	expectedSignature, err := signHMAC(signingInput)
	if err != nil {
		return Claims{}, err
	}

	if !hmac.Equal(signature, expectedSignature) {
		return Claims{}, errors.New("token inválido")
	}

	claimsJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return Claims{}, errors.New("token inválido")
	}

	var claims Claims
	if err := json.Unmarshal(claimsJSON, &claims); err != nil {
		return Claims{}, errors.New("token inválido")
	}

	if claims.Exp < time.Now().Unix() {
		return Claims{}, errors.New("token expirado")
	}

	return claims, nil
}

func signHMAC(message string) ([]byte, error) {
	h := hmac.New(sha256.New, []byte(defaultJWTSecret()))
	_, err := h.Write([]byte(message))
	if err != nil {
		return nil, err
	}
	return h.Sum(nil), nil
}

func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.Request.Method == "OPTIONS" {
			ctx.Next()
			return
		}

		path := ctx.Request.URL.Path
		if path == "/login" || path == "/health" {
			ctx.Next()
			return
		}

		authorization := strings.TrimSpace(ctx.GetHeader("Authorization"))
		if authorization == "" {
			ctx.JSON(401, gin.H{"erro": "token de acesso obrigatório"})
			ctx.Abort()
			return
		}

		parts := strings.SplitN(authorization, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			ctx.JSON(401, gin.H{"erro": "formato do token inválido"})
			ctx.Abort()
			return
		}

		claims, err := ValidateToken(parts[1])
		if err != nil {
			ctx.JSON(401, gin.H{"erro": err.Error()})
			ctx.Abort()
			return
		}

		ctx.Set("username", claims.Username)
		ctx.Next()
	}
}
