package config

import (
	"errors"
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
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}

	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL == "" {
		return nil, errors.New("Sem URL do banco de dados")
	}
	cfg := Config{
		Database: DatabaseConfig{
			URL: databaseURL,
		},
	}
	return &cfg, nil
}