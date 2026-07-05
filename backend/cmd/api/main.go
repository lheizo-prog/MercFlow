package main

import (
	"MercFlow/internal/handlers"
	"MercFlow/internal/repository"
	"MercFlow/internal/service"
	"fmt"
)

func main() {
	//Criando os repositórios para os produtos BASE
	repo := repository.NovoMemoryProdutoRepository()
	serv := service.NovoProdutoService(repo)
	handler := handlers.NovoProdutoHandler(serv)

	//Produtos BASE
	maca := handler.CriarProduto(1, "Maçã", "12345")
	pera := handler.CriarProduto(2, "Pêra", "12346")

	//Adicionando produtos BASE ao repositório BASE
	handler.Adicionar(maca)
	handler.Adicionar(pera)

	//DEBUG
	handler.Listar()

	maca = handler.CriarProduto(1, "Maçã top das galáxias", "12345")

	handler.Atualizar(maca)

	handler.Listar()

	handler.BuscarProdutoCodigo("12346")

	handler.RemoverID(0)
	handler.Adicionar(pera)

	handler.RemoverID(2)
	handler.Listar()
	fmt.Println("_______________________________________________")
	//-----------------------------------------------------------------
	//Criação dos repositórios dos DEPARTAMENTOS
	repoD := repository.NovoMemoryDepartamentoRepository()
	servD := service.NovoDepartamentoService(repoD)
	handlerD := handlers.NovoDepartamentoHandler(servD)

	//Setores
	frios := handlerD.CriarDepartamento(1, "Frios")
	padaria := handlerD.CriarDepartamento(2, "Padaria")
	
	//Adicionando setores ao repositório DEPARTAMENTO
	handlerD.Adicionar(frios)
	handlerD.Adicionar(padaria)

	//DEBUG
	handlerD.Listar()

	handlerD.BuscarID(2)

	handlerD.RemoverID(1)

	handlerD.Listar()
}