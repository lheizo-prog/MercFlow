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

	// P0-3: Validar que o criador pode criar o perfil solicitado
	perfilMaximoPermitido := perfilMaximoParaCriador(claims.Role)
	if !perfilEhValido(payload.Perfil) {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "perfil inválido"})
		return
	}
	if !perfilPodeCriar(claims.Role, payload.Perfil, perfilMaximoPermitido) {
		ctx.JSON(http.StatusForbidden, gin.H{"erro": "perfil não permitido para este role"})
		return
	}

	// P0-3: Validar que as permissões enviadas são subconjunto das oficiais do perfil
	permissoesOficiais := permissoesOficiaisDoPerfil(payload.Perfil)
	if !contemTodas(permissoesOficiais, payload.Permissoes) {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "permissões inválidas para o perfil selecionado"})
		return
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

// perfilMaximoParaCriador retorna o máximo perfil que um role pode criar.
// super_admin pode criar qualquer perfil; admin pode criar admin e operador;
// operadores/visualizadores não podem criar usuários (isso já é bloqueado por RequirePermission).
func perfilMaximoParaCriador(role string) string {
	if strings.EqualFold(role, "super_admin") {
		return "super_admin"
	}
	if strings.EqualFold(role, "admin") {
		return "admin"
	}
	return "operador"
}

func perfilEhValido(perfil string) bool {
	switch strings.ToLower(strings.TrimSpace(perfil)) {
	case "operador", "admin", "visualizador", "super_admin":
		return true
	default:
		return false
	}
}

func perfilPodeCriar(criadorRole, perfilCriado, maxPermitido string) bool {
	if strings.EqualFold(criadorRole, "super_admin") {
		return true
	}
	if strings.EqualFold(criadorRole, "admin") {
		return perfilCriado == "admin" || perfilCriado == "operador"
	}
	return false
}

func permissoesOficiaisDoPerfil(perfil string) []string {
	switch strings.ToLower(strings.TrimSpace(perfil)) {
	case "operador":
		return []string{
			"dashboard.read",
			"lancamento.create",
			"lancamento.read",
			"lancamento.calculate",
			"produto.read",
			"departamento.read",
		}
	case "admin":
		return []string{
			"dashboard.read",
			"dashboard.export",
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
	case "visualizador":
		return []string{
			"dashboard.read",
			"lancamento.read",
			"lancamento.calculate",
			"produto.read",
			"departamento.read",
		}
	case "super_admin":
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
	default:
		return nil
	}
}

func contemTodas(oficiais []string, solicitadas []string) bool {
	for _, perm := range solicitadas {
		encontrou := false
		for _, oficial := range oficiais {
			if strings.EqualFold(strings.TrimSpace(perm), strings.TrimSpace(oficial)) {
				encontrou = true
				break
			}
		}
		if !encontrou {
			return false
		}
	}
	return true
}
