package dashboard

import (
	"context"
	"fmt"
	"strings"

	request "MercFlow/internal/models/requests"
	response "MercFlow/internal/models/response"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DashboardPostgresRepository struct {
	db *pgxpool.Pool
}

func NovoDashboardPostgresRepository(
	db *pgxpool.Pool,
) *DashboardPostgresRepository {
	return &DashboardPostgresRepository{
		db: db,
	}
}

func (r *DashboardPostgresRepository) BuscarLancamentos(
	filtros *request.DashboardLancamentoRequest,
) (*response.DashboardLancamentoResponse, error) {
	ctx := context.Background()

	var args []interface{}
	param := 1

	where := ""
	if filtros.LojaID > 0 && len(filtros.LojaIDs) == 0 {
		where += fmt.Sprintf(" AND base.loja_id = $%d", param)
		args = append(args, filtros.LojaID)
		param++
	}
	if len(filtros.LojaIDs) > 0 {
		placeholders := make([]string, len(filtros.LojaIDs))
		for index, lojaID := range filtros.LojaIDs {
			placeholders[index] = fmt.Sprintf("$%d", param)
			args = append(args, lojaID)
			param++
		}
		where += " AND base.loja_id IN (" + strings.Join(placeholders, ", ") + ")"
	}

	if filtros.Tipo != "" {
		where += fmt.Sprintf(
			" AND base.tipo = $%d",
			param,
		)

		args = append(args, filtros.Tipo)
		param++
	}

	if filtros.DataInicio != "" {
		where += fmt.Sprintf(
			" AND base.data_lancamento >= $%d::date",
			param,
		)

		args = append(args, filtros.DataInicio)
		param++
	}

	if filtros.DataFinal != "" {
		where += fmt.Sprintf(
			" AND base.data_lancamento < ($%d::date + INTERVAL '1 day')",
			param,
		)

		args = append(args, filtros.DataFinal)
		param++
	}

	if filtros.DepartamentoID > 0 {
		where += fmt.Sprintf(
			" AND base.departamento_id = $%d",
			param,
		)

		args = append(args, filtros.DepartamentoID)
		param++
	}

	if filtros.ProdutoID > 0 {
		where += fmt.Sprintf(`
			AND (
				base.produto_mercearia_id = $%d
				OR base.produto_departamento_id = $%d
			)
		`, param, param)

		args = append(args, filtros.ProdutoID)
		param++
	}

	if filtros.ProdutoGenericoID > 0 {
		where += fmt.Sprintf(
			" AND base.produto_generico_id = $%d",
			param,
		)

		args = append(args, filtros.ProdutoGenericoID)
		param++
	}

	// ============================================================
	// CONSULTA
	// ============================================================

	query := `
		WITH base AS (

			-- =====================================================
			-- QUEBRA
			-- =====================================================

			SELECT
				l.id AS lancamento_id,
				l.tipo,
				l.data_lancamento,
				l.departamento_id,
				l.loja_id,

				li.produto_mercearia_id,
				li.produto_departamento_id,
				COALESCE(
					li.produto_mercearia_id,
					li.produto_departamento_id
				) AS produto_id,

				COALESCE(
					pm.produto_generico_id,
					pd.produto_generico_id
				) AS produto_generico_id,

				COALESCE(
					pm.descricao,
					pd.nome
				) AS produto,

				CASE LOWER(TRIM(COALESCE(pm.unidade_medida, pd.unidade_medida)))
					WHEN 'kg' THEN li.quantidade
					WHEN 'g' THEN li.quantidade / 1000
					WHEN 'gr' THEN li.quantidade / 1000
					WHEN 'l' THEN li.quantidade * 1000
					WHEN 'ml' THEN li.quantidade
					ELSE li.quantidade
				END AS quantidade,

				CASE LOWER(TRIM(COALESCE(pm.unidade_medida, pd.unidade_medida)))
					WHEN 'kg' THEN 'kg'
					WHEN 'g' THEN 'kg'
					WHEN 'gr' THEN 'kg'
					WHEN 'l' THEN 'ml'
					WHEN 'ml' THEN 'ml'
					ELSE LOWER(TRIM(COALESCE(pm.unidade_medida, pd.unidade_medida)))
				END AS unidade

			FROM lancamentos l

			INNER JOIN lancamento_itens li
				ON li.lancamento_id = l.id

			LEFT JOIN produtos_mercearia pm
				ON pm.id = li.produto_mercearia_id

			LEFT JOIN produtos_departamento pd
				ON pd.id = li.produto_departamento_id

			WHERE l.tipo = 'QUEBRA'

			UNION ALL

			-- =====================================================
			-- TRANSFERENCIA
			-- =====================================================

			SELECT
				l.id AS lancamento_id,
				l.tipo,
				l.data_lancamento,
				l.departamento_id,
				l.loja_id,

				li.produto_mercearia_id,
				li.produto_departamento_id,
				COALESCE(
					li.produto_mercearia_id,
					li.produto_departamento_id
				) AS produto_id,

				pm.produto_generico_id AS produto_generico_id,

				pd.nome AS produto,

				CASE LOWER(TRIM(pd.unidade_medida))
					WHEN 'kg' THEN (
					li.quantidade
					* pm.quantidade_embalagem
					*
					CASE

						WHEN LOWER(TRIM(pm.unidade_medida))
							= LOWER(TRIM(pd.unidade_medida))
							OR (LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr')
								AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr'))
						THEN 1

						WHEN LOWER(TRIM(pm.unidade_medida)) = 'kg'
							AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr')
						THEN 1000

						WHEN LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr')
							AND LOWER(TRIM(pd.unidade_medida)) = 'kg'
						THEN 0.001

						WHEN LOWER(TRIM(pm.unidade_medida)) = 'l'
							AND LOWER(TRIM(pd.unidade_medida)) = 'ml'
						THEN 1000

						WHEN LOWER(TRIM(pm.unidade_medida)) = 'ml'
							AND LOWER(TRIM(pd.unidade_medida)) = 'l'
						THEN 0.001

						ELSE 0
					END
					)
					WHEN 'g' THEN (
						li.quantidade * pm.quantidade_embalagem * CASE
							WHEN LOWER(TRIM(pm.unidade_medida)) = LOWER(TRIM(pd.unidade_medida)) OR (LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr') AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr')) THEN 1
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'kg' AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr') THEN 1000
							WHEN LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr') AND LOWER(TRIM(pd.unidade_medida)) = 'kg' THEN 0.001
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'l' AND LOWER(TRIM(pd.unidade_medida)) = 'ml' THEN 1000
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'ml' AND LOWER(TRIM(pd.unidade_medida)) = 'l' THEN 0.001
							ELSE 0
						END
					) / 1000
					WHEN 'gr' THEN (
						li.quantidade * pm.quantidade_embalagem * CASE
							WHEN LOWER(TRIM(pm.unidade_medida)) = LOWER(TRIM(pd.unidade_medida)) OR (LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr') AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr')) THEN 1
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'kg' AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr') THEN 1000
							WHEN LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr') AND LOWER(TRIM(pd.unidade_medida)) = 'kg' THEN 0.001
							ELSE 0
						END
					) / 1000
					WHEN 'l' THEN (
						li.quantidade * pm.quantidade_embalagem * CASE
							WHEN LOWER(TRIM(pm.unidade_medida)) = LOWER(TRIM(pd.unidade_medida)) THEN 1
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'kg' AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr') THEN 1000
							WHEN LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr') AND LOWER(TRIM(pd.unidade_medida)) = 'kg' THEN 0.001
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'l' AND LOWER(TRIM(pd.unidade_medida)) = 'ml' THEN 1000
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'ml' AND LOWER(TRIM(pd.unidade_medida)) = 'l' THEN 0.001
							ELSE 0
						END
					) * 1000
					ELSE (
						li.quantidade * pm.quantidade_embalagem * CASE
							WHEN LOWER(TRIM(pm.unidade_medida)) = LOWER(TRIM(pd.unidade_medida)) THEN 1
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'kg' AND LOWER(TRIM(pd.unidade_medida)) IN ('g', 'gr') THEN 1000
							WHEN LOWER(TRIM(pm.unidade_medida)) IN ('g', 'gr') AND LOWER(TRIM(pd.unidade_medida)) = 'kg' THEN 0.001
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'l' AND LOWER(TRIM(pd.unidade_medida)) = 'ml' THEN 1000
							WHEN LOWER(TRIM(pm.unidade_medida)) = 'ml' AND LOWER(TRIM(pd.unidade_medida)) = 'l' THEN 0.001
							ELSE 0
						END
					)
				END AS quantidade,

				CASE LOWER(TRIM(pd.unidade_medida))
					WHEN 'kg' THEN 'kg'
					WHEN 'g' THEN 'kg'
					WHEN 'gr' THEN 'kg'
					WHEN 'l' THEN 'ml'
					WHEN 'ml' THEN 'ml'
					ELSE LOWER(TRIM(pd.unidade_medida))
				END AS unidade

			FROM lancamentos l

			INNER JOIN lancamento_itens li
				ON li.lancamento_id = l.id

			INNER JOIN produtos_mercearia pm
				ON pm.id = li.produto_mercearia_id

			INNER JOIN produtos_departamento pd
				ON pd.id = li.produto_departamento_id

			WHERE l.tipo = 'TRANSFERENCIA'
		)

		SELECT
			base.produto_id,
			base.produto_generico_id,
			MIN(base.produto) AS produto,
			MIN(base.unidade) AS unidade,

			COALESCE(
				SUM(base.quantidade),
				0
			) AS quantidade,

			COUNT(DISTINCT base.lancamento_id)
				AS quantidade_registros

		FROM base

		WHERE 1 = 1
	`

	query += where

	query += `
		GROUP BY base.produto_id, base.produto_generico_id
		ORDER BY quantidade DESC
	`

	// ============================================================
	// EXECUÇÃO
	// ============================================================

	rows, err := r.db.Query(
		ctx,
		query,
		args...,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"erro ao consultar dashboard de lançamentos: %w",
			err,
		)
	}

	defer rows.Close()

	// ============================================================
	// RESULTADOS
	// ============================================================

	ranking := make(
		[]response.DashboardLancamentoRankingItem,
		0,
	)

	var totalQuantidade float64
	var quantidadeRegistros int

	for rows.Next() {

		var item response.DashboardLancamentoRankingItem

		var quantidade float64
		var registros int

		err := rows.Scan(
			&item.ProdutoID,
			&item.ProdutoGenericoID,
			&item.Produto,
			&item.Unidade,
			&quantidade,
			&registros,
		)

		if err != nil {
			return nil, fmt.Errorf(
				"erro ao ler resultado do dashboard: %w",
				err,
			)
		}

		item.Quantidade = quantidade

		ranking = append(
			ranking,
			item,
		)

		totalQuantidade += quantidade
		quantidadeRegistros += registros
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf(
			"erro ao percorrer resultados do dashboard: %w",
			err,
		)
	}

	// ============================================================
	// RESPONSE
	// ============================================================

	return &response.DashboardLancamentoResponse{

		Filtros: response.DashboardLancamentoFiltrosReponse{
			Tipo:              filtros.Tipo,
			DataInicio:        filtros.DataInicio,
			DataFim:           filtros.DataFinal,
			DepartamentoID:    filtros.DepartamentoID,
			ProdutoID:         filtros.ProdutoID,
			ProdutoGenericoID: filtros.ProdutoGenericoID,
		},

		Resumo: response.DashboardLancamentoResumoResponse{
			TotalQuantidade:     totalQuantidade,
			QuantidadeRegistros: quantidadeRegistros,
		},

		Ranking: ranking,
	}, nil
}
