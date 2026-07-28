package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProdutoDepartamentoHandler struct{
	service *service.ProdutoDepartamentoService
}

func NovoProdutoDepartamentoHandler(s *service.ProdutoDepartamentoService) *ProdutoDepartamentoHandler{
	return &ProdutoDepartamentoHandler{
		service: s,
	}
}

func(h *ProdutoDepartamentoHandler) HandleProdutosDepartamento(router *gin.Engine){
	produtos_departamento := router.Group("/produtos_d")

	produtos_departamento.GET("",h.Listar)
	produtos_departamento.POST("",h.Criar)
	produtos_departamento.GET("/:id",h.BuscarID)
	produtos_departamento.GET("/codigo/:codigo",h.BuscarCodigo)
	produtos_departamento.PUT("/id/:id",h.Atualizar)
	produtos_departamento.DELETE("/id/:id",h.RemoverID)

}

func(h *ProdutoDepartamentoHandler)Criar(ctx *gin.Context){
	var produto models.ProdutoDepartamento

	err := ctx.BindJSON(&produto); if err != nil{
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

func (h *ProdutoDepartamentoHandler)Atualizar(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}

	var produto models.ProdutoDepartamento

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

func(h *ProdutoDepartamentoHandler)RemoverID(ctx *gin.Context){
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
		ctx.JSON(http.StatusBadGateway, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, gin.H{
		"messagem":"produto removido com sucesso",
	})
}

func(h *ProdutoDepartamentoHandler)Listar(ctx *gin.Context){
	lista, err := h.service.Listar()
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func(h *ProdutoDepartamentoHandler)BuscarID(ctx *gin.Context){
	str := ctx.Param("id")

	id, err := strconv.Atoi(str)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
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

func(h *ProdutoDepartamentoHandler)BuscarCodigo(ctx *gin.Context){
	codigo := ctx.Param("codigo")
	
	produto, err := h.service.BuscarCodigo(codigo)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}