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
	"sync"
	"time"

	"MercFlow/internal/service"

	"github.com/gin-gonic/gin"
)

var usuarioService *service.UsuarioService

// Init inicializa o pacote auth com as dependências necessárias
func Init(us *service.UsuarioService) {
	usuarioService = us
}

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

		// Buscar o estado atual do usuário no banco para evitar
		// autorização baseada em JWT desatualizado. O JWT pode carregar
		// role/permissões antigas por até 8 horas; esta validação garante
		// que revogações, mudanças de perfil e desativações tenham efeito
		// imediato na próxima requisição.
		usuario, err := usuarioService.BuscarPorID(claims.UserID)
		if err != nil {
			log.Printf("RequirePermission: falha ao buscar usuario id=%d: %v", claims.UserID, err)
			ctx.JSON(401, gin.H{"erro": "usuário não encontrado"})
			ctx.Abort()
			return
		}
		if usuario == nil {
			log.Printf("RequirePermission: usuario id=%d nao encontrado", claims.UserID)
			ctx.JSON(401, gin.H{"erro": "usuário não encontrado"})
			ctx.Abort()
			return
		}
		if !usuario.Ativo {
			ctx.JSON(401, gin.H{"erro": "usuário inativo"})
			ctx.Abort()
			return
		}

		// O papel atual do usuário deve vir do banco, não do JWT.
		// Usuários super_admin continuam tendo acesso total.
		if usuario.Perfil != "super_admin" && !HasPermission(usuario.Permissoes, permission) {
			ctx.JSON(403, gin.H{"erro": "permissão insuficiente"})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

// RateLimitLogin middleware que aplica rate limiting no endpoint de login.
// Limita 10 tentativas por minuto por IP.
type loginLimiter struct {
	mu      sync.Mutex
	visitors map[string]*visitor
}

type visitor struct {
	count    int
	expiresAt time.Time
}

var (
	loginRateLimiter = &loginLimiter{visitors: make(map[string]*visitor)}
	loginLimitCount  = 10
	loginLimitWindow = time.Minute
)

// AllowLogin verifica se o IP pode fazer login. Retorna true se permitido.
func (l *loginLimiter) AllowLogin(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	v, exists := l.visitors[ip]
	if !exists || now.After(v.expiresAt) {
		l.visitors[ip] = &visitor{count: 1, expiresAt: now.Add(loginLimitWindow)}
		return true
	}

	if v.count >= loginLimitCount {
		return false
	}
	v.count++
	return true
}

// clientIP retorna o IP do cliente (IP externo ou remote address).
func clientIP(ctx *gin.Context) string {
	ip := ctx.ClientIP()
	if ip == "" {
		ip = ctx.Request.RemoteAddr
	}
	// Normaliza IPv6 loopback
	if ip == "[::1]" {
		ip = "127.0.0.1"
	}
	return ip
}

// RateLimitLogin middleware que aplica rate limiting no endpoint de login.
func RateLimitLogin() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ip := clientIP(ctx)
		if !loginRateLimiter.AllowLogin(ip) {
			ctx.JSON(429, gin.H{
				"erro": "muitas tentativas de login. Tente novamente em 1 minuto.",
			})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}

var (
	mutationRateLimiter = &loginLimiter{visitors: make(map[string]*visitor)}
	mutationLimitCount  = 120
	mutationLimitWindow = time.Minute
)

// AllowMutation verifica se o IP pode executar mutações (POST, PUT, DELETE).
func (l *loginLimiter) AllowMutation(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	v, exists := l.visitors[ip]
	if !exists || now.After(v.expiresAt) {
		l.visitors[ip] = &visitor{count: 1, expiresAt: now.Add(mutationLimitWindow)}
		return true
	}

	if v.count >= mutationLimitCount {
		return false
	}
	v.count++
	return true
}

// RateLimitMutation middleware que protege endpoints de mutação contra DoS e flood
func RateLimitMutation() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		method := ctx.Request.Method
		if method == "POST" || method == "PUT" || method == "PATCH" || method == "DELETE" {
			ip := clientIP(ctx)
			if !mutationRateLimiter.AllowMutation(ip) {
				ctx.JSON(429, gin.H{
					"erro": "limite de requisições excedido. Tente novamente em 1 minuto.",
				})
				ctx.Abort()
				return
			}
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

// WSAuthMiddleware autentica conexões WebSocket via token na query string
// (?token=...). É necessário porque a API WebSocket dos navegadores não
// permite o envio de headers customizados (como Authorization) durante o
// handshake, tornando o AuthMiddleware baseado em header inutilizável para
// essas conexões.
func WSAuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := strings.TrimSpace(ctx.Query("token"))
		if token == "" {
			ctx.JSON(401, gin.H{"erro": "token de acesso obrigatório"})
			ctx.Abort()
			return
		}

		claims, err := ValidateToken(token)
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
