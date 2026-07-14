package repository

import (
	"MercFlow/internal/models"
)

type ProdutoRepository interface{
	Adicionar(produto *models.Produto) (*models.Produto, error)
	RemoverID(id int) error
	BuscarProdutoID(id int) (*models.Produto, error)
	BuscarProdutoCodigo(codigo string) (*models.Produto, error)
	Atualizar(produto models.Produto) error
	Listar() ([]*models.Produto, error)
}

type MemoryProdutoRepository struct{
	produtos []*models.Produto
}

func NovoMemoryProdutoRepository() *MemoryProdutoRepository{
	return &MemoryProdutoRepository{
		produtos: []*models.Produto{
			models.CriarProduto(1, "Arroz", "12345"),
			models.CriarProduto(2, "Feijão","12346"),
		},
	}
}

func (r *MemoryProdutoRepository) Adicionar(p *models.Produto){
	r.produtos = append(r.produtos, p)
}

func (r *MemoryProdutoRepository)RemoverID(id int){
	for i, p := range r.produtos{
		if p.ID == id{
			r.produtos = append(r.produtos[:i], r.produtos[i+1:]...)
		}
	}

}

func (r *MemoryProdutoRepository) BuscarProdutoID(id int) *models.Produto{
	for _, p := range r.produtos{
		if p.ID == id{
			return p
		}
	}
	return nil
}

func (r *MemoryProdutoRepository) BuscarProdutoCodigo(codigo string) *models.Produto{
	for _, p := range r.produtos{
		if p.Codigo_Geral == codigo{
			return p
		}
	}
	return nil
}

func (r *MemoryProdutoRepository) Atualizar(p *models.Produto){
	for i, x := range r.produtos{
		if x.ID == p.ID{
			r.produtos[i] = p
		}
	}
}

func (r *MemoryProdutoRepository) Listar() []*models.Produto{
	return r.produtos
}
