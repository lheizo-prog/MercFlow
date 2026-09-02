package config

import (
	"errors"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
}

type DatabaseConfig struct {
	URL string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: .env não encontrado, usando variáveis de ambiente do sistema")
	}

	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL == "" {
		return nil, errors.New("sem URL do banco de dados")
	}
	cfg := Config{
		Database: DatabaseConfig{
			URL: databaseURL,
		},
	}
	return &cfg, nil
}
