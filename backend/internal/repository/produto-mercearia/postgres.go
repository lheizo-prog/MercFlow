package produtomercearia

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProdutoMerceariaPostgresRepository struct {
	db *pgxpool.Pool
}

func NovoProdutoMerceariaPostgresRepository(db *pgxpool.Pool) *ProdutoMerceariaPostgresRepository {
	return &ProdutoMerceariaPostgresRepository{
		db: db,
	}
}

