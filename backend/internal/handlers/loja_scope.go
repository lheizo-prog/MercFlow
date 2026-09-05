package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/repository/loja"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// LojaScope representa o escopo de acesso a lojas
type LojaScope struct {
	lojaRepo *loja.PostgresLojaRepository
}

func NovoLojaScope(lojaRepo *loja.PostgresLojaRepository) *LojaScope {
	return &LojaScope{lojaRepo: lojaRepo}
}

// obterLojaDoUsuario retorna a loja que o usuário está acessando.
// Retorna (lojaID, ok). Se ok=false, houve erro de autorização.
// Se lojaID=0, significa "todas as lojas" (super_admin sem filtro).
func (s *LojaScope) ObterLojaDoUsuario(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok || claims.LojaID <= 0 {
		return 0, false
	}

	// Super admin pode acessar múltiplas lojas
	if claims.Role == "super_admin" {
		lojaHeader := strings.TrimSpace(ctx.GetHeader("X-Loja-ID"))
		if lojaHeader == "" {
			// Super admin sem header = acesso a todas as lojas
			return 0, true
		}

		lojaID, err := strconv.Atoi(lojaHeader)
		if err != nil || lojaID <= 0 {
			// Header inválido = rejeitar
			return 0, false
		}

		// Validar que a loja existe e está ativa
		if !s.lojaValida(lojaID) {
			return 0, false
		}
		return lojaID, true
	}

	// Admin pode filtrar por loja
	if claims.Role == "admin" {
		lojaHeader := strings.TrimSpace(ctx.GetHeader("X-Loja-ID"))
		if lojaHeader != "" {
			lojaID, err := strconv.Atoi(lojaHeader)
			if err == nil && lojaID > 0 {
				// Validar que a loja existe e está ativa
				if !s.lojaValida(lojaID) {
					return 0, false
				}
				return lojaID, true
			}
		}
		// Sem header ou inválido = usa própria loja
		return claims.LojaID, true
	}

	// Operador e visualizador só podem acessar a própria loja
	return claims.LojaID, true
}

// lojaValida verifica se a loja existe, está ativa e é acessível pelo usuário
func (s *LojaScope) lojaValida(lojaID int) bool {
	lojaObj, err := s.lojaRepo.BuscarID(lojaID)
	if err != nil {
		return false
	}
	return lojaObj != nil && lojaObj.Ativo
}

// PerfilPodeNavegarLojas retorna true se o perfil pode navegar entre lojas
func PerfilPodeNavegarLojas(claims auth.Claims) bool {
	return strings.EqualFold(claims.Role, "admin") || strings.EqualFold(claims.Role, "super_admin")
}

// ObterLojaParaCriacao retorna a loja para criação de recursos
func (s *LojaScope) ObterLojaParaCriacao(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok {
		return 0, false
	}

	// Super admin e admin podem especificar loja via query param
	if claims.Role == "super_admin" || claims.Role == "admin" {
		if lojaID, err := strconv.Atoi(ctx.Query("loja_id")); err == nil && lojaID > 0 {
			if !s.lojaValida(lojaID) {
				return 0, false
			}
			return lojaID, true
		}
		// Fallback para própria loja
		return claims.LojaID, claims.LojaID > 0
	}

	// Outros perfis usam própria loja
	return claims.LojaID, claims.LojaID > 0
}
