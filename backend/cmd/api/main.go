package main

import (
	"MercFlow/internal/handlers"
	"MercFlow/internal/repository"
	"MercFlow/internal/service"
	"fmt"
	"time"
)

func main() {
	//Criando os repositórios para os produtos BASE
	repoPB := repository.NovoMemoryProdutoRepository()
	servPB := service.NovoProdutoService(repoPB)
	handlerPB := handlers.NovoProdutoHandler(servPB)

	//Produtos BASE
	maca := handlerPB.CriarProduto(1, "Maçã", "12345")
	pera := handlerPB.CriarProduto(2, "Pêra", "12346")

	//Adicionando produtos BASE ao repositório BASE
	handlerPB.Adicionar(maca)
	handlerPB.Adicionar(pera)

	//DEBUG
	handlerPB.Listar()

	maca = handlerPB.CriarProduto(1, "Maçã top das galáxias", "12345")

	handlerPB.Atualizar(maca)

	handlerPB.Listar()

	handlerPB.BuscarProdutoCodigo("12346")

	handlerPB.RemoverID(0)
	handlerPB.Adicionar(pera)

	handlerPB.RemoverID(2)
	handlerPB.Listar()
	fmt.Println("_______________________________________________")
	//-----------------------------------------------------------------
	//Criação dos repositórios para os produtos dos setores
	//Frios
	repoPF := repository.NovoMemoryProdutoRepository()
	servPF := service.NovoProdutoService(repoPF)
	handlerPF := handlers.NovoProdutoHandler(servPF)
	//Padaria
	repoPP := repository.NovoMemoryProdutoRepository()
	servPP := service.NovoProdutoService(repoPP)
	handlerPP := handlers.NovoProdutoHandler(servPP)

	//Materia prima dos frios
	macaF := handlerPF.CriarProduto(maca.ID, maca.Nome, "00001")
	peraF := handlerPF.CriarProduto(pera.ID, pera.Nome, "00002")

	//Materia prima da padaria
	macaP := handlerPP.CriarProduto(maca.ID, maca.Nome, "00010")
	peraP := handlerPP.CriarProduto(pera.ID, pera.Nome, "00020")

	//Materia prima adicionada ao repositório dos frios
	handlerPF.Adicionar(macaF)
	handlerPF.Adicionar(peraF)

	//Materia prima adicionada ao repositorio da padaria
	handlerPP.Adicionar(macaP)
	handlerPP.Adicionar(peraP)
	
	//-----------------------------------------------------------------
	//Criação dos repositórios dos DEPARTAMENTOS
	repoD := repository.NovoMemoryDepartamentoRepository()
	servD := service.NovoDepartamentoService(repoD)
	handlerD := handlers.NovoDepartamentoHandler(servD)

	//Setores
	frios := handlerD.CriarDepartamento(1, "Frios", repoPF.Listar())
	padaria := handlerD.CriarDepartamento(2, "Padaria", repoPP.Listar())
	
	//Adicionando setores ao repositório DEPARTAMENTO
	handlerD.Adicionar(frios)
	handlerD.Adicionar(padaria)

	//DEBUG
	handlerD.Listar()

	handlerD.BuscarID(2)

	handlerD.RemoverID(1)

	handlerD.Listar()

	for _, p := range frios.Codigos{
		fmt.Printf(
			"\n| ID: %d | Produto: %s | Código: %s |\n",
			p.ID,
			p.Nome,
			p.Codigo_Geral,
		)
	}

	// repositório para os lançamentos
	repoLancamentos := repository.NovoMemoryLancamentoRepository()
	servLancamentos := service.NovoLancamentoService(repoLancamentos)
	handlerLancamentos := handlers.NovoLancamentoHandler(servLancamentos)

	sliceT := handlerLancamentos.NovoSliceTemporario()
	item1, _ := handlerLancamentos.NovoItem(frios, macaF, maca.Codigo_Geral, macaF.Codigo_Geral, 0.233)
	item2, _ := handlerLancamentos.NovoItem(frios, peraF, pera.Codigo_Geral, peraF.Codigo_Geral, 0.523)
	sliceT, _ = handlerLancamentos.AdicionarST(sliceT, item1)
	sliceT, _ = handlerLancamentos.AdicionarST(sliceT, item2)

	lancamentos01, err := handlerLancamentos.NovoLancamento(1,"Quebra", time.Now(), sliceT)
	if err != nil{
		fmt.Println(err)
	} else{
		for _, p := range lancamentos01.Itens{
			fmt.Printf(
				"\n| Setor: %s | Produto: %s | Código Base: %s | Código Setor: %s | Quantidade: %f |\n",
				p.Setor.Nome,
				p.Produto.Nome,
				p.CodigoBase,
				p.CodigoSetor,
				p.Quantidade,
			)
		}
	}
		
	handlerLancamentos.Adicionar(lancamentos01)
	handlerLancamentos.Listar()

	handlerLancamentos.ListarCodigoSetor()
}