package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

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
	produtos.GET("/:id", h.BuscarID)
	produtos.GET("/codigo/:codigo",h.BuscarProduto)
	produtos.PUT("/id/:id",h.Atualizar)
	produtos.DELETE("/id/:id",h.RemoverID)
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

func (h *ProdutoHandler)Atualizar(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}

	var produto models.Produto
	
	if err := ctx.BindJSON(&produto); err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"JSON inválido",
		})
		return
	}
	produto.ID = id

	produtoAtualizado, err := h.service.Atualizar(&produto)

	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, produtoAtualizado)
}

func (h *ProdutoHandler)RemoverID(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)

	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}
	err = h.service.RemoverID(id)

	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"messagem":"Produto removido com sucesso",
	})
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

func (h *ProdutoHandler)BuscarID(ctx *gin.Context){
	str := ctx.Param("id")
	id, err := strconv.Atoi(str)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	produto, err := h.service.BuscarID(id)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	ctx.JSON(200, produto)
}

func (h *ProdutoHandler)BuscarProduto(ctx *gin.Context){
	cod := ctx.Param("codigo")
	produto, err := h.service.BuscarCodigo(cod)

	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	ctx.JSON(200, produto)
}