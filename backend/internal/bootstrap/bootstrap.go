package bootstrap

import (
	"MercFlow/internal/config"
	"MercFlow/internal/database"
	"MercFlow/internal/handlers"
	"MercFlow/internal/middleware"
	"MercFlow/internal/service"
	"MercFlow/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func New(DB *pgxpool.Pool) (*gin.Engine, error){

	router := gin.Default()
	
	router.Use(middleware.CORS()) 

	cfg, err := config.Load()
	if err != nil{
		return nil, err
	}

	db, err := database.NovaConexao(cfg.Database.URL)
	if err != nil{
		return nil, err
	}

	repo := repository.NovoPostgresProdutoRepository(db)
	service := service.NovoProdutoService(repo)
	handler := handlers.NovoProdutoHandler(service)

	return router, nil
}