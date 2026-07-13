package api

import (
	"MercFlow/internal/handlers"
	"MercFlow/internal/models"

	"github.com/gin-gonic/gin"
)

type ProdutoHTTPHandler struct {
	handler *handlers.ProdutoHandler
}

func NovoProdutoHTTPHandler(handler *handlers.ProdutoHandler) *ProdutoHTTPHandler{
	
	
	return &ProdutoHTTPHandler{
		handler: handler,
	}
}

func (h *ProdutoHTTPHandler) Listar(ctx *gin.Context) {
	produto, err := h.handler.Listar()

	if err != nil{
		ctx.JSON(400, gin.H{
			"erro":err.Error(),
		})
		return
	}
	ctx.JSON(200, produto)
}

func (h *ProdutoHTTPHandler) Criar(ctx *gin.Context) {
	var produto models.Produto

	err := ctx.ShouldBindJSON(&produto)

	if err != nil{
		ctx.JSON(400, gin.H{
			"erro":err.Error(),
		})
		return
	}

	produtoCriado, err := h.handler.CriarProduto(&produto)
	if err != nil{
		ctx.JSON(400, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(201, produtoCriado)
}