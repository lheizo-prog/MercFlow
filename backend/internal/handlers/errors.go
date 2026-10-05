package handlers

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// ResponderErro sanitiza a mensagem de erro para o cliente. Se o erro for
// uma falha de banco de dados interna ou técnica (Postgres, driver, etc.),
// mascara como erro 500 genérico e registra os detalhes técnicos no log.
// Se for validação ou regra de negócio esperada, devolve 400 com a mensagem.
func ResponderErro(ctx *gin.Context, err error, fallbackMensagem string) {
	if err == nil {
		return
	}

	errMsg := err.Error()

	// Identificar mensagens de infraestrutura ou banco que não devem vazar para o cliente
	ehErroTecnico := strings.Contains(errMsg, "pgx") ||
		strings.Contains(errMsg, "pq:") ||
		strings.Contains(errMsg, "driver:") ||
		strings.Contains(errMsg, "violates foreign key") ||
		strings.Contains(errMsg, "violates unique constraint") ||
		strings.Contains(errMsg, "column reference") ||
		strings.Contains(errMsg, "relation \"") ||
		strings.Contains(errMsg, "connection refused") ||
		strings.Contains(errMsg, "no rows in result set")

	if ehErroTecnico {
		log.Printf("[ERRO INTERNO] Rota %s %s: %v", ctx.Request.Method, ctx.Request.URL.Path, err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"erro": fallbackMensagem,
		})
		return
	}

	ctx.JSON(http.StatusBadRequest, gin.H{
		"erro": errMsg,
	})
}
