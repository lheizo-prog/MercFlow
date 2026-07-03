package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"fmt"
)

type ProdutoHandler struct {
	service *service.ProdutoService
}

func NovoProdutoHandler(s *service.ProdutoService) *ProdutoHandler{
	return &ProdutoHandler{
		service: s,
	}
}

func (h *ProdutoHandler) CriarProduto(id int, nome, codigo_geral string) *models.Produto{
	if h.service.CriarProduto(id, nome, codigo_geral) == nil{
		fmt.Println(h.service.CriarProduto(id, nome, codigo_geral))
	}
	fmt.Printf(
		"Criando produto: %s ",
		nome,
	)
	return models.CriarProduto(id, nome, codigo_geral)
}

func (h *ProdutoHandler) Adicionar(p *models.Produto){
	if h.service.Adicionar(p) != nil{
		fmt.Println(h.service.Adicionar(p))
		return
	}
	fmt.Println("Adicionando produto... ")
	h.service.Adicionar(p)
}

func (h *ProdutoHandler) RemoverID(id int) {
	if h.service.RemoverID(id) != nil{
		fmt.Println(h.service.RemoverID(id))
		return
	}
	fmt.Println("Removendo produto... ")
	h.service.RemoverID(id)
}

func (h *ProdutoHandler) BuscarProdutoID(id int) (*models.Produto){
	res, err := h.service.BuscarProdutoID(id)

	if err != nil{
		fmt.Println(err)
		return nil
	}
	fmt.Println("Buscando produto...")
	fmt.Printf(
		"\nID: %d | Descrição: %s | Código Geral: %s\n",
		res.ID,
		res.Nome,
		res.Codigo_Geral,
	)
	return res
}

func (h *ProdutoHandler) BuscarProdutoCodigo(codigo string) (*models.Produto){
	res, err := h.service.BuscarProdutoCodigo(codigo)

	if err != nil{
		fmt.Println(err)
		return nil
	}
	fmt.Println("Buscando produto... ")
	fmt.Printf(
		"\nID: %d | Descrição: %s | Código Geral: %s\n",
		res.ID,
		res.Nome,
		res.Codigo_Geral,
	)
	return res
}

func (h *ProdutoHandler) Atualizar(p *models.Produto){
	if h.service.Atualizar(p) != nil{
		fmt.Println(h.service.Atualizar(p))
		return
	}
	fmt.Println("Atualizando produto... ")
	h.service.Atualizar(p)
	fmt.Printf(
		"\nID: %d | Descrição: %s | Código Geral: %s\n",
		p.ID,
		p.Nome,
		p.Codigo_Geral,
	)
}

func (h *ProdutoHandler) Listar(){
	res, err := h.service.Listar()

	if err != nil{
		fmt.Println(err)
		return
	}
	fmt.Println("______________________________________________________")
	fmt.Println("Lista de Produto:")
	for _, p := range res{
		fmt.Printf(
			"\n| ID: %d | Nome: %s | Codigo Geral: %s|\n",
			p.ID,
			p.Nome,
			p.Codigo_Geral,
		)
	}
	fmt.Println("______________________________________________________")
}