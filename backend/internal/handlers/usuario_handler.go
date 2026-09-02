package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type UsuarioHandler struct {
	service *service.UsuarioService
}

func NovoUsuarioHandler(s *service.UsuarioService) *UsuarioHandler {
	return &UsuarioHandler{service: s}
}

func (h *UsuarioHandler) HandleUsuarios(router gin.IRouter) {
	usuarios := router.Group("/usuarios")
	usuarios.POST("", auth.RequirePermission("usuario.create"), h.Criar)
	usuarios.GET("", auth.RequirePermission("usuario.read"), h.Listar)
	usuarios.GET("/:id", auth.RequirePermission("usuario.read"), h.BuscarPorID)
}

type CriarUsuarioRequest struct {
	Nome       string   `json:"nome"`
	Username   string   `json:"username"`
	Senha      string   `json:"senha"`
	LojaID     int      `json:"loja_id"`
	Perfil     string   `json:"perfil"`
	Permissoes []string `json:"permissoes"`
}

func (h *UsuarioHandler) Criar(ctx *gin.Context) {
	var payload CriarUsuarioRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "dados inválidos"})
		return
	}

	if strings.TrimSpace(payload.Nome) == "" || strings.TrimSpace(payload.Username) == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "nome e username são obrigatórios"})
		return
	}
	if strings.TrimSpace(payload.Senha) == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "senha obrigatória"})
		return
	}
	if payload.LojaID <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "loja obrigatória"})
		return
	}
	claimsValue, _ := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "claims inválidas"})
		return
	}
	if claims.Role != "super_admin" {
		payload.LojaID = claims.LojaID
	}
	if payload.Perfil == "" {
		payload.Perfil = "operador"
	}

	usuario, err := h.service.Criar(&models.Usuario{
		Nome:       payload.Nome,
		Username:   payload.Username,
		SenhaHash:  payload.Senha,
		LojaID:     payload.LojaID,
		Perfil:     payload.Perfil,
		Permissoes: payload.Permissoes,
	})
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"id":         usuario.ID,
		"nome":       usuario.Nome,
		"username":   usuario.Username,
		"loja_id":    usuario.LojaID,
		"perfil":     usuario.Perfil,
		"permissoes": usuario.Permissoes,
	})
}

func (h *UsuarioHandler) Listar(ctx *gin.Context) {
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

	var usuarios []*models.Usuario
	var err error
	if claims.Role == "super_admin" {
		usuarios, err = h.service.ListarTodos()
	} else {
		usuarios, err = h.service.ListarPorLoja(claims.LojaID)
	}
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, usuarios)
}

func (h *UsuarioHandler) BuscarPorID(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "id inválido"})
		return
	}

	claimsValue, _ := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "claims inválidas"})
		return
	}
	usuario, err := h.service.BuscarPorID(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}
	if claims.Role != "super_admin" && usuario.LojaID != claims.LojaID {
		ctx.JSON(http.StatusForbidden, gin.H{"erro": "usuário de outra loja"})
		return
	}

	ctx.JSON(http.StatusOK, usuario)
}
