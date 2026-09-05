package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/repository/loja"
	"sync"

	"github.com/gin-gonic/gin"
)

// scopeGlobal é o escopo global de lojas
var (
	scopeGlobal     *LojaScope
	scopeGlobalOnce sync.Once
)

// InitScope inicializa o escopo global de lojas
func InitScope(lojaRepo *loja.PostgresLojaRepository) {
	scopeGlobalOnce.Do(func() {
		scopeGlobal = NovoLojaScope(lojaRepo)
	})
}

// GetScope retorna o escopo global de lojas
func GetScope() *LojaScope {
	return scopeGlobal
}

// lojaDoUsuario retorna a loja do usuário (função legacy para compatibilidade)
func lojaDoUsuario(ctx *gin.Context) (int, bool) {
	return GetScope().ObterLojaDoUsuario(ctx)
}

// lojaParaCriacao retorna a loja para criação (função legacy para compatibilidade)
func lojaParaCriacao(ctx *gin.Context) (int, bool) {
	return GetScope().ObterLojaParaCriacao(ctx)
}

// perfilPodeNavegarLojas retorna true se o perfil pode navegar entre lojas
func perfilPodeNavegarLojas(claims auth.Claims) bool {
	return PerfilPodeNavegarLojas(claims)
}
