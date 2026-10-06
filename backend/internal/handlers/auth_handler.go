package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/service"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *service.UsuarioService
}

func NovoAuthHandler(s *service.UsuarioService) *AuthHandler {
	return &AuthHandler{service: s}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(ctx *gin.Context) {
	var payload LoginRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "dados de login inválidos"})
		return
	}

	// 1. Checar se a conta está temporariamente bloqueada por excesso de falhas
	if bloqueado, tempoRestante := auth.IsAccountLocked(payload.Username); bloqueado {
		minutosRestantes := int(tempoRestante.Minutes()) + 1
		ctx.JSON(http.StatusTooManyRequests, gin.H{
			"erro": fmt.Sprintf("conta temporariamente bloqueada por segurança devido a tentativas incorretas. Tente novamente em %d minuto(s).", minutosRestantes),
		})
		return
	}

	usuario, err := h.service.Autenticar(payload.Username, payload.Password)
	if err != nil || usuario == nil {
		auth.RecordFailedLogin(payload.Username)
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "credenciais inválidas"})
		return
	}

	// Sucesso: limpa contador de falhas
	auth.ResetFailedLogins(payload.Username)

	token, err := auth.GenerateTokenForUser(auth.User{
		ID:          usuario.ID,
		Username:    usuario.Username,
		Nome:        usuario.Nome,
		LojaID:      usuario.LojaID,
		Role:        usuario.Perfil,
		Permissions: usuario.Permissoes,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"erro": "não foi possível gerar o token"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token":      token,
		"username":   usuario.Username,
		"nome":       usuario.Nome,
		"loja_id":    usuario.LojaID,
		"loja_nome":  usuario.LojaNome,
		"perfil":     usuario.Perfil,
		"permissoes": usuario.Permissoes,
	})
}

// GerarWSTicket gera um ticket de uso único descartável (30s) para o cliente abrir a conexão WebSocket
func (h *AuthHandler) GerarWSTicket(ctx *gin.Context) {
	claimsValue, exists := ctx.Get("claims")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	claims, ok := claimsValue.(auth.Claims)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "claims inválidas"})
		return
	}

	ticket, err := auth.GenerateWSTicket(claims)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"erro": "não foi possível gerar ticket para WebSocket"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ticket": ticket,
	})
}
