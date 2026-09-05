package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type User struct {
	ID          int      `json:"id"`
	Username    string   `json:"username"`
	Nome        string   `json:"nome"`
	LojaID      int      `json:"loja_id"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
}

type Claims struct {
	UserID      int      `json:"user_id"`
	Username    string   `json:"username"`
	Nome        string   `json:"nome"`
	LojaID      int      `json:"loja_id"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
	Iat         int64    `json:"iat"`
	Exp         int64    `json:"exp"`
}

func requireEnv(name string) string {
	value := os.Getenv(name)
	if value == "" {
		log.Fatalf("variável de ambiente %q é obrigatória", name)
	}
	return value
}

func requireEnvMinLen(name string, minLen int) string {
	value := os.Getenv(name)
	if value == "" {
		log.Fatalf("variável de ambiente %q é obrigatória", name)
	}
	if len(value) < minLen {
		log.Fatalf("variável de ambiente %q deve ter pelo menos %d caracteres", name, minLen)
	}
	return value
}

func defaultAdminUsername() string {
	return strings.TrimSpace(requireEnv("ADMIN_USERNAME"))
}

func defaultAdminPassword() string {
	return requireEnvMinLen("ADMIN_PASSWORD", 12)
}

func defaultJWTSecret() string {
	return requireEnvMinLen("JWT_SECRET", 32)
}

func defaultAdminPermissions() []string {
	return []string{
		"dashboard.read",
		"dashboard.compare",
		"loja.switch",
		"lancamento.create",
		"lancamento.read",
		"lancamento.calculate",
		"produto.read",
		"produto.create",
		"produto.update",
		"departamento.read",
		"departamento.create",
		"usuario.read",
		"usuario.create",
		"usuario.update",
	}
}

func defaultAdminUser() User {
	return User{
		ID:          1,
		Username:    defaultAdminUsername(),
		Nome:        "Administrador",
		LojaID:      1,
		Role:        "super_admin",
		Permissions: defaultAdminPermissions(),
	}
}

func HasPermission(permissions []string, permission string) bool {
	for _, item := range permissions {
		if strings.EqualFold(strings.TrimSpace(item), strings.TrimSpace(permission)) {
			return true
		}
	}
	return false
}

func CheckCredentials(username, password string) bool {
	// Usa hmac.Equal para comparação em tempo constante (segurança contra timing attacks)
	return strings.EqualFold(username, defaultAdminUsername()) &&
		hmac.Equal([]byte(password), []byte(defaultAdminPassword()))
}

func GenerateToken(username string) (string, error) {
	// Busca o usuário pelo username para gerar token correto
	// Retorna erro se não for o admin padrão
	if username != defaultAdminUsername() {
		return "", errors.New("usuário não autorizado para geração de token via GenerateToken")
	}
	return GenerateTokenForUser(defaultAdminUser())
}

func GenerateTokenForUser(user User) (string, error) {
	header := map[string]string{"alg": "HS256", "typ": "JWT"}
	claims := Claims{
		UserID:      user.ID,
		Username:    user.Username,
		Nome:        user.Nome,
		LojaID:      user.LojaID,
		Role:        user.Role,
		Permissions: user.Permissions,
		Iat:         time.Now().Unix(),
		Exp:         time.Now().Add(8 * time.Hour).Unix(),
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

func RequirePermission(permission string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		claimsValue, exists := ctx.Get("claims")
		if !exists {
			ctx.JSON(401, gin.H{"erro": "usuário não autenticado"})
			ctx.Abort()
			return
		}

		claims, ok := claimsValue.(Claims)
		if !ok {
			ctx.JSON(401, gin.H{"erro": "claims inválidas"})
			ctx.Abort()
			return
		}

		if claims.Role != "super_admin" && !HasPermission(claims.Permissions, permission) {
			ctx.JSON(403, gin.H{"erro": "permissão insuficiente"})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
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
		ctx.Set("user_id", claims.UserID)
		ctx.Set("loja_id", claims.LojaID)
		ctx.Set("role", claims.Role)
		ctx.Set("permissions", claims.Permissions)
		ctx.Set("claims", claims)
		ctx.Next()
	}
}
