package produto_generico

import (
	"MercFlow/internal/models"
	"errors"
)

type MemoryProdutoRepository struct {
	produtos []*models.ProdutoGenerico
}

func NovoMemoryProdutoRepository() *MemoryProdutoRepository {
	return &MemoryProdutoRepository{
		produtos: []*models.ProdutoGenerico{
			models.NovoProdutoGenerico(1, "Arroz", "12345"),
			models.NovoProdutoGenerico(2, "Feijão", "12346"),
		},
	}
}

func (r *MemoryProdutoRepository) Criar(p *models.ProdutoGenerico) (*models.ProdutoGenerico, error){
	r.produtos = append(r.produtos, p)
	return p, nil
}

func (r *MemoryProdutoRepository) RemoverID(id int) {
	for i, p := range r.produtos {
		if p.ID == id {
			r.produtos = append(r.produtos[:i], r.produtos[i+1:]...)
		}
	}

}

func (r *MemoryProdutoRepository) BuscarID(id int) (*models.ProdutoGenerico, error) {
	for _, p := range r.produtos {
		if p.ID == id {
			return p, nil
		}
	}
	return nil, errors.New("Produto não encontrado")
}

func (r *MemoryProdutoRepository) BuscarProdutoCodigo(codigo string) *models.ProdutoGenerico {
	for _, p := range r.produtos {
		if p.Codigo_Geral == codigo {
			return p
		}
	}
	return nil
}

func (r *MemoryProdutoRepository) Atualizar(p *models.ProdutoGenerico) {
	for i, x := range r.produtos {
		if x.ID == p.ID {
			r.produtos[i] = p
		}
	}
}

func (r *MemoryProdutoRepository) Listar() []*models.ProdutoGenerico {
	return r.produtos
}