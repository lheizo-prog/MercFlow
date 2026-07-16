package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NovaConexao(databaseURL string) (*pgxpool.Pool, error){
	fmt.Println("URL recebida:", databaseURL)
	dbpool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil{
		return nil, err
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil{
		return nil, err
	}
	fmt.Println("Usuário:",config.ConnConfig.User)
	fmt.Println("Banco:",config.ConnConfig.Database)

	return dbpool, nil 
}