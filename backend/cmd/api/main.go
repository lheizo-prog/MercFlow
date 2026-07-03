package main

import (
	"MercFlow/internal/handlers"
	"MercFlow/internal/repository"
	"MercFlow/internal/service"
)

func main() {
	repo := repository.NovoMemoryProdutoRepository()
	serv := service.NovoProdutoService(repo)
	handler := handlers.NovoProdutoHandler(serv)

	maca := handler.CriarProduto(1, "Maçã", "12345")
	pera := handler.CriarProduto(2, "Pêra", "12346")

	handler.Adicionar(maca)
	handler.Adicionar(pera)

	handler.Listar()

	maca = handler.CriarProduto(1, "Maçã top das galáxias", "12345")

	handler.Atualizar(maca)

	handler.Listar()

	handler.BuscarProdutoCodigo("12346")

	handler.RemoverID(0)
	handler.Adicionar(pera)

	handler.RemoverID(2)
	handler.Listar()
}