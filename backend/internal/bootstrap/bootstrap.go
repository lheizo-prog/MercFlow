package bootstrap

import (
	"MercFlow/internal/config"
	"MercFlow/internal/database"
	"MercFlow/internal/handlers"
	"MercFlow/internal/middleware"
	"MercFlow/internal/repository/departamento"
	produtodepartamento "MercFlow/internal/repository/produto-departamento"
	produtogenerico "MercFlow/internal/repository/produto-generico"
	produtomercearia "MercFlow/internal/repository/produto-mercearia"
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

	produtoRepo := produtogenerico.NovoPostgresProdutoGenericoRepository(db)
	produtoService := service.NovoProdutoService(produtoRepo)
	produtoHandler := handlers.NovoProdutoGenericoHandler(produtoService)
	produtoHandler.HandleProdutosGenericos(router)

	departamentoRepo := departamento.NovoPostgresDepartamentoRepository(db)
	departamentoService := service.NovoDepartamentoService(departamentoRepo)
	departamentoHandler := handlers.NovoDepartamentoHandler(departamentoService)
	departamentoHandler.HandleDepartamentos(router)

	produto_dRepo := produtodepartamento.NovoPostgresProdutoDepartamentoRepository(db)
	produto_dService := service.NovoProdutoDepartamentoService(produto_dRepo, produtoRepo, departamentoRepo)
	produto_dHandler := handlers.NovoProdutoDepartamentoHandler(produto_dService)
	produto_dHandler.HandleProdutosDepartamento(router)

	produto_mRepo := produtomercearia.NovoProdutoMerceariaPostgresRepository(db)
	produto_mService := service.NovoProdutoMerceariaService(produto_mRepo, produtoRepo)
	produto_mHandler := handlers.NovoProdutoMerceariaHandler(produto_mService)
	produto_mHandler.HandleProdutosMercearia(router)

	return &Application{
		Router: router,
		DB: db,
		Config: cfg,
	}, nil
}