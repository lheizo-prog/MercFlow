package config

import (
	"errors"
	"fmt"
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
	err := godotenv.Load("../../../.env")
	if err != nil {
		return nil, err
	}

	databaseURL := os.Getenv("DATABASE_URL")

	fmt.Printf("DATABASE_URL = %q\n", databaseURL)

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