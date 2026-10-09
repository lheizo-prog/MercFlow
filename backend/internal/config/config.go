package config

import (
	"errors"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Database       DatabaseConfig
	LabelReaderURL string
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

	labelReaderURL := os.Getenv("LABEL_READER_URL")
	if labelReaderURL == "" {
		labelReaderURL = "http://localhost:8001"
	}

	cfg := Config{
		Database: DatabaseConfig{
			URL: databaseURL,
		},
		LabelReaderURL: labelReaderURL,
	}
	return &cfg, nil
}
