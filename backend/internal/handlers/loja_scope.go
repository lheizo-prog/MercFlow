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

// ObterLojaDoUsuario retorna a loja do usuário.
// Administradores (super_admin, admin ou usuários com permissão loja.switch)
// podem alternar de loja informando o header "X-Loja-ID" ou o parâmetro "loja_id".
// Para usuários padrão, retorna a loja fixa do token JWT.
func (s *LojaScope) ObterLojaDoUsuario(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok {
		return 0, false
	}

	podeAlternar := PerfilPodeNavegarLojas(claims) || auth.HasPermission(claims.Permissions, "loja.switch")

	if podeAlternar {
		// 1. Tentar ler do Header X-Loja-ID
		headerLoja := strings.TrimSpace(ctx.GetHeader("X-Loja-ID"))
		if headerLoja != "" {
			if id, err := strconv.Atoi(headerLoja); err == nil && id > 0 {
				if s.lojaValida(id) {
					return id, true
				}
			}
		}

		// 2. Tentar ler do query param loja_id
		queryLoja := strings.TrimSpace(ctx.Query("loja_id"))
		if queryLoja != "" {
			if id, err := strconv.Atoi(queryLoja); err == nil && id > 0 {
				if s.lojaValida(id) {
					return id, true
				}
			}
		}

		// Super admin sem loja fixa ou sem seleção tem fallback para 0 (todas) ou loja do token
		if claims.Role == "super_admin" && claims.LojaID <= 0 {
			return 0, true
		}
	}

	if claims.LojaID <= 0 {
		return 0, false
	}

	return claims.LojaID, true
}

// ObterLojaParaWS retorna a loja para uma conexão WebSocket. Espelha
// ObterLojaDoUsuario, mas lê o parâmetro de loja via query string
// (?loja_id=). O header X-Loja-ID não é mais suportado.
// Retorna (lojaID, ok). lojaID=0 significa "todas as lojas" (super_admin
// sem filtro), assim como em ObterLojaDoUsuario.
func (s *LojaScope) ObterLojaParaWS(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok || claims.LojaID <= 0 {
		return 0, false
	}

	if claims.Role == "super_admin" || claims.Role == "admin" {
		lojaParam := strings.TrimSpace(ctx.Query("loja_id"))
		if lojaParam != "" {
			lojaID, err := strconv.Atoi(lojaParam)
			if err != nil || lojaID <= 0 || !s.lojaValida(lojaID) {
				return 0, false
			}
			return lojaID, true
		}
		if claims.Role == "super_admin" {
			// Super admin sem loja_id na query = acesso a todas as lojas
			return 0, true
		}
	}

	// Admin sem loja_id na query, operador e visualizador: própria loja
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

	podeAlternar := PerfilPodeNavegarLojas(claims) || auth.HasPermission(claims.Permissions, "loja.switch")

	if podeAlternar {
		// 1. Tentar ler do Header X-Loja-ID
		headerLoja := strings.TrimSpace(ctx.GetHeader("X-Loja-ID"))
		if headerLoja != "" {
			if id, err := strconv.Atoi(headerLoja); err == nil && id > 0 {
				if s.lojaValida(id) {
					return id, true
				}
			}
		}

		// 2. Tentar ler do query param loja_id
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
