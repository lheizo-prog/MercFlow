package database

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NovaConexao(databaseURL string) (*pgxpool.Pool, error) {
	dbpool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return nil, err
	}

	return dbpool, nil
}
