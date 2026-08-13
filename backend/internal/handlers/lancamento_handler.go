package handlers

import (
	request "MercFlow/internal/models/requests"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LancamentoHandler struct {
	service *service.LancamentoService
}

func NovoLancamentoHandler(s *service.LancamentoService) *LancamentoHandler{
	return &LancamentoHandler{
		service: s,
	}
}

func(h *LancamentoHandler)HandleLancamentos(router *gin.Engine){
	lancamentos := router.Group("/produtos_g")

	lancamentos.GET("",h.Listar)
	lancamentos.POST("",h.Criar)
	lancamentos.GET("/:id",h.BuscarID)
}

func(h *LancamentoHandler)Criar(ctx *gin.Context){
	var lancamento request.LancamentoRequest

	err := ctx.BindJSON(&lancamento)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"JSON inválido",
		})
		return
	}

	lancamentoCriado, err := h.service.Criar(&lancamento)

	ctx.JSON(201, lancamentoCriado)
}

func(h *LancamentoHandler)Listar(ctx *gin.Context){
	lista, err := h.service.Listar()
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func(h *LancamentoHandler)BuscarID(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}

	lancamento, err := h.service.BuscarID(id)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, lancamento)
}