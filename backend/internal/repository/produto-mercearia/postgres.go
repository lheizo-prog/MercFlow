package produtomercearia

import (
	"MercFlow/internal/models"
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
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

func (r *ProdutoMerceariaPostgresRepository) Criar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error) {
	err := r.db.QueryRow(
		context.Background(),
		"INSERT INTO produtos_mercearia (produto_generico_id, sku, marca, descricao, codigo_barras, quantidade_embalagem, unidade_medida, loja_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, ativo",
		p.ProdutoGenericoID,
		p.SKU,
		p.Marca,
		p.Descricao,
		p.CodigoBarras,
		p.QuantidadeEmbalagem,
		p.UnidadeMedida,
		p.LojaID,
	).Scan(&p.ID, &p.Ativo)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *ProdutoMerceariaPostgresRepository) Atualizar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error) {
	response, err := r.db.Exec(
		context.Background(),
		"UPDATE produtos_mercearia SET produto_generico_id = $1, sku = $2, marca = $3, descricao = $4, codigo_barras = $5, quantidade_embalagem = $6, unidade_medida = $7, ativo = $8 WHERE id = $9",
		p.ProdutoGenericoID,
		p.SKU,
		p.Marca,
		p.Descricao,
		p.CodigoBarras,
		p.QuantidadeEmbalagem,
		p.UnidadeMedida,
		p.Ativo,
		p.ID,
	)
	if err != nil {
		return nil, err
	}
	if response.RowsAffected() == 0 {
		return nil, errors.New("produto não encontrado")
	}

	return p, nil
}

func (r *ProdutoMerceariaPostgresRepository) Listar() ([]*models.ProdutoMercearia, error) {
	rows, err := r.db.Query(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id, pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.ProdutoMercearia{}

	for rows.Next() {
		produto := &models.ProdutoMercearia{}
		err := rows.Scan(
			&produto.ID,
			&produto.LojaID,
			&produto.ProdutoGenericoID,
			&produto.ProdutoGenericoNome,
			&produto.SKU,
			&produto.Marca,
			&produto.Descricao,
			&produto.CodigoBarras,
			&produto.QuantidadeEmbalagem,
			&produto.UnidadeMedida,
			&produto.Ativo,
		)
		if err != nil {
			return nil, err
		}
		lista = append(lista, produto)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *ProdutoMerceariaPostgresRepository) ListarPorLoja(lojaID int) ([]*models.ProdutoMercearia, error) {
	if lojaID <= 0 {
		return nil, errors.New("loja inválida")
	}
	rows, err := r.db.Query(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id, pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id WHERE pm.loja_id = $1",
		lojaID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.ProdutoMercearia{}

	for rows.Next() {
		produto := &models.ProdutoMercearia{}
		if err := rows.Scan(
			&produto.ID,
			&produto.LojaID,
			&produto.ProdutoGenericoID,
			&produto.ProdutoGenericoNome,
			&produto.SKU,
			&produto.Marca,
			&produto.Descricao,
			&produto.CodigoBarras,
			&produto.QuantidadeEmbalagem,
			&produto.UnidadeMedida,
			&produto.Ativo,
		); err != nil {
			return nil, err
		}
		lista = append(lista, produto)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *ProdutoMerceariaPostgresRepository) RemoverID(id int) error {
	response, err := r.db.Exec(
		context.Background(),
		"DELETE FROM produtos_mercearia WHERE id = $1;",
		id,
	)
	if err != nil {
		return err
	}
	if response.RowsAffected() == 0 {
		return errors.New("produto não encontrado")
	}

	return nil
}

func (r *ProdutoMerceariaPostgresRepository) BuscarID(id int) (*models.ProdutoMercearia, error) {
	produto := &models.ProdutoMercearia{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id, pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id WHERE pm.id = $1;",
		id,
	)

	err := row.Scan(
		&produto.ID,
		&produto.LojaID,
		&produto.ProdutoGenericoID,
		&produto.ProdutoGenericoNome,
		&produto.SKU,
		&produto.Marca,
		&produto.Descricao,
		&produto.CodigoBarras,
		&produto.QuantidadeEmbalagem,
		&produto.UnidadeMedida,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}
	if err != nil {
		return nil, err
	}

	return produto, nil
}

func (r *ProdutoMerceariaPostgresRepository) BuscarSKU(sku string) (*models.ProdutoMercearia, error) {
	produto := &models.ProdutoMercearia{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id, pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id WHERE pm.sku = $1;",
		sku,
	)

	err := row.Scan(
		&produto.ID,
		&produto.LojaID,
		&produto.ProdutoGenericoID,
		&produto.ProdutoGenericoNome,
		&produto.SKU,
		&produto.Marca,
		&produto.Descricao,
		&produto.CodigoBarras,
		&produto.QuantidadeEmbalagem,
		&produto.UnidadeMedida,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}
	if err != nil {
		return nil, err
	}

	return produto, nil
}

func (r *ProdutoMerceariaPostgresRepository) BuscarCodigoBarras(codigoBarras string) (*models.ProdutoMercearia, error) {
	produto := &models.ProdutoMercearia{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id, pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id WHERE pm.codigo_barras = $1;",
		codigoBarras,
	)

	err := row.Scan(
		&produto.ID,
		&produto.LojaID,
		&produto.ProdutoGenericoID,
		&produto.ProdutoGenericoNome,
		&produto.SKU,
		&produto.Marca,
		&produto.Descricao,
		&produto.CodigoBarras,
		&produto.QuantidadeEmbalagem,
		&produto.UnidadeMedida,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}
	if err != nil {
		return nil, err
	}

	return produto, nil
}

func (r *ProdutoMerceariaPostgresRepository) Buscar(texto string) ([]*models.ProdutoMercearia, error) {
	texto = strings.TrimSpace(strings.ToLower(texto))

	rows, err := r.db.Query(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id,pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id WHERE pm.ativo = TRUE AND (LOWER(pm.sku) LIKE '%' || $1 || '%' OR LOWER(pm.marca) LIKE '%' || $1 || '%' OR LOWER(pm.descricao) LIKE '%' || $1 || '%' OR LOWER(pm.codigo_barras) LIKE '%' || $1 || '%') ORDER BY CASE WHEN LOWER(pm.sku) = $1 THEN 1 WHEN LOWER(pm.codigo_barras) = $1 THEN 2 ELSE 3 END, pm.marca;",
		texto,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.ProdutoMercearia{}

	for rows.Next() {
		produto := &models.ProdutoMercearia{}
		if err := rows.Scan(
			&produto.ID,
			&produto.LojaID,
			&produto.ProdutoGenericoID,
			&produto.ProdutoGenericoNome,
			&produto.SKU,
			&produto.Marca,
			&produto.Descricao,
			&produto.CodigoBarras,
			&produto.QuantidadeEmbalagem,
			&produto.UnidadeMedida,
			&produto.Ativo,
		); err != nil {
			return nil, err
		}
		lista = append(lista, produto)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *ProdutoMerceariaPostgresRepository) BuscarInativo(sku string) (*models.ProdutoMercearia, error) {
	produto := &models.ProdutoMercearia{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id, pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id WHERE pm.sku = $1 AND pm.ativo = FALSE;",
		sku,
	)

	err := row.Scan(
		&produto.ID,
		&produto.LojaID,
		&produto.ProdutoGenericoID,
		&produto.ProdutoGenericoNome,
		&produto.SKU,
		&produto.Marca,
		&produto.Descricao,
		&produto.CodigoBarras,
		&produto.QuantidadeEmbalagem,
		&produto.UnidadeMedida,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}
	if err != nil {
		return nil, err
	}

	return produto, nil
}

func (r *ProdutoMerceariaPostgresRepository) Reativar(id int) error {
	response, err := r.db.Exec(
		context.Background(),
		"UPDATE produtos_mercearia SET ativo = TRUE WHERE id = $1;",
		id,
	)
	if err != nil {
		return err
	}
	if response.RowsAffected() == 0 {
		return errors.New("produto não encontrado")
	}

	return nil
}
func (r *ProdutoMerceariaPostgresRepository) BuscarPorLoja(texto string, lojaID int) ([]*models.ProdutoMercearia, error) {
	if lojaID <= 0 {
		return nil, errors.New("loja inválida")
	}
	texto = strings.TrimSpace(strings.ToLower(texto))

	rows, err := r.db.Query(
		context.Background(),
		"SELECT pm.id, pm.loja_id, pm.produto_generico_id, pg.nome, pm.sku, pm.marca, pm.descricao, pm.codigo_barras, pm.quantidade_embalagem, pm.unidade_medida, pm.ativo FROM produtos_mercearia pm JOIN produtos_genericos pg ON pm.produto_generico_id = pg.id WHERE pm.loja_id = $1 AND pm.ativo = TRUE AND (LOWER(pm.sku) LIKE '%' || $2 || '%' OR LOWER(pm.marca) LIKE '%' || $2 || '%' OR LOWER(pm.descricao) LIKE '%' || $2 || '%' OR LOWER(pm.codigo_barras) LIKE '%' || $2 || '%') ORDER BY CASE WHEN LOWER(pm.sku) = $2 THEN 1 WHEN LOWER(pm.codigo_barras) = $2 THEN 2 ELSE 3 END, pm.marca;",
		lojaID, texto,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.ProdutoMercearia{}

	for rows.Next() {
		produto := &models.ProdutoMercearia{}
		if err := rows.Scan(
			&produto.ID,
			&produto.LojaID,
			&produto.ProdutoGenericoID,
			&produto.ProdutoGenericoNome,
			&produto.SKU,
			&produto.Marca,
			&produto.Descricao,
			&produto.CodigoBarras,
			&produto.QuantidadeEmbalagem,
			&produto.UnidadeMedida,
			&produto.Ativo,
		); err != nil {
			return nil, err
		}
		lista = append(lista, produto)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}


