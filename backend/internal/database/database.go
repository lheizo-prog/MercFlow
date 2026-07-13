package database

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NovaConexao() (*pgxpool.Pool, error){
	dbpool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil{
		dbpool.Close()
		return nil, err
	}

	return dbpool, nil 
}