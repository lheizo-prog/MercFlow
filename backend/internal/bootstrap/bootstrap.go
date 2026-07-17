package bootstrap

import (
	"MercFlow/internal/config"
	"MercFlow/internal/database"
	"MercFlow/internal/handlers"
	"MercFlow/internal/middleware"
	"MercFlow/internal/repository"
	"MercFlow/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Application struct{
	Router *gin.Engine
	DB *pgxpool.Pool
	Config *config.Config
}

func New() (*Application, error){

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

	produtoRepo := repository.NovoPostgresProdutoRepository(db)
	produtoService := service.NovoProdutoService(produtoRepo)
	produtoHandler := handlers.NovoProdutoHandler(produtoService)
	produtoHandler.HandleProdutos(router)


	return &Application{
		Router: router,
		DB: db,
		Config: cfg,
	}, nil
}