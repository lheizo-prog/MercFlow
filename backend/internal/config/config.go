package config

import (
	"errors"
	"os"
)

type Config struct {
	Database DatabaseConfig
}

type DatabaseConfig struct {
	URL string
}

func Load() (*Config, error) {
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