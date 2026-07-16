package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProdutoHandler struct {
	service *service.ProdutoService
}

func NovoProdutoHandler(s *service.ProdutoService) *ProdutoHandler{
	return &ProdutoHandler{
		service: s,
	}
}
func (h *ProdutoHandler) HandleProdutos(router *gin.Engine){
	produtos := router.Group("/produtos")

	produtos.GET("",h.Listar)
	produtos.POST("", h.Criar)
}

func (h *ProdutoHandler) Criar(ctx *gin.Context) {
	var produto models.Produto

	err := ctx.BindJSON(&produto)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	produtoCriado, err := h.service.Criar(&produto)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	ctx.JSON(201, produtoCriado)

}

func (h *ProdutoHandler) Listar(ctx *gin.Context){
	lista, err := h.service.Listar()

	if err != nil{
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"erro":err.Error(),
		})
		return
	}
	ctx.JSON(200, lista)
}