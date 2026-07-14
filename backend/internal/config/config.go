package config

type Config struct {
	DatabaseURL DatabaseConfig
	ServerPort  string
	JWTSecret   string
}

type DatabaseConfig struct {
	URL string
}