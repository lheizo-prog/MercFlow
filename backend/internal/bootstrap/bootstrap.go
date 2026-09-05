package bootstrap

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/config"
	"MercFlow/internal/database"
	"MercFlow/internal/handlers"
	"MercFlow/internal/middleware"
	dashboardrepo "MercFlow/internal/repository/dashboard"
	"MercFlow/internal/repository/departamento"
	"MercFlow/internal/repository/lancamento"
	"MercFlow/internal/repository/loja"
	produtodepartamento "MercFlow/internal/repository/produto-departamento"
	produtogenerico "MercFlow/internal/repository/produto-generico"
	produtomercearia "MercFlow/internal/repository/produto-mercearia"
	"MercFlow/internal/repository/usuario"
	"MercFlow/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Application struct {
	Router *gin.Engine
	DB     *pgxpool.Pool
	Config *config.Config
}

func New() (*Application, error) {

	router := gin.Default()
	router.Use(middleware.CORS())

	cfg, err := config.Load()
	if err != nil {
		return nil, err
	}

	db, err := database.NovaConexao(cfg.Database.URL)
	if err != nil {
		return nil, err
	}

	usuarioRepo := usuario.NovoPostgresUsuarioRepository(db)
	if err := usuarioRepo.CriarOuAtualizarAdminPadrao(); err != nil {
		return nil, err
	}
	usuarioService := service.NovoUsuarioService(usuarioRepo)
	authHandler := handlers.NovoAuthHandler(usuarioService)
	usuarioHandler := handlers.NovoUsuarioHandler(usuarioService)
	lojaRepo := loja.NovoPostgresLojaRepository(db)
	lojaHandler := handlers.NovoLojaHandler(lojaRepo)
	handlers.InitScope(lojaRepo)
	router.POST("/login", authHandler.Login)
	router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"status": "ok"})
	})

	produtoRepo := produtogenerico.NovoPostgresProdutoGenericoRepository(db)
	produtoService := service.NovoProdutoService(produtoRepo)
	produtoHandler := handlers.NovoProdutoGenericoHandler(produtoService)

	departamentoRepo := departamento.NovoPostgresDepartamentoRepository(db)
	departamentoService := service.NovoDepartamentoService(departamentoRepo)
	departamentoHandler := handlers.NovoDepartamentoHandler(departamentoService)

	produto_dRepo := produtodepartamento.NovoPostgresProdutoDepartamentoRepository(db)
	produto_dService := service.NovoProdutoDepartamentoService(produto_dRepo, produtoRepo, departamentoRepo)
	produto_dHandler := handlers.NovoProdutoDepartamentoHandler(produto_dService)

	produto_mRepo := produtomercearia.NovoProdutoMerceariaPostgresRepository(db)
	produto_mService := service.NovoProdutoMerceariaService(produto_mRepo, produtoRepo)
	produto_mHandler := handlers.NovoProdutoMerceariaHandler(produto_mService)

	lancamentoRepo := lancamento.NovoLancamentoPostgresRepositoy(db)
	lancamentoService := service.NovoLancamentoService(lancamentoRepo, produto_mRepo, produto_dRepo, departamentoRepo)
	lancamentoHandler := handlers.NovoLancamentoHandler(lancamentoService)

	dashboardRepository := dashboardrepo.NovoDashboardPostgresRepository(db)
	dashboardService := service.NovoDashboardService(dashboardRepository)
	dashboardHandler := handlers.NovoDashboardHandler(dashboardService)

	// Grupo protegido — só rotas aqui exigem JWT
	protected := router.Group("/")
	protected.Use(auth.AuthMiddleware())
	{
		usuarioHandler.HandleUsuarios(protected)
		lojaHandler.HandleLojas(protected)
		produtoHandler.HandleProdutosGenericos(protected)
		departamentoHandler.HandleDepartamentos(protected)
		produto_dHandler.HandleProdutosDepartamento(protected)
		produto_mHandler.HandleProdutosMercearia(protected)
		lancamentoHandler.HandleLancamentos(protected)
		dashboardHandler.HandleDashboard(protected)
	}

	return &Application{
		Router: router,
		DB:     db,
		Config: cfg,
	}, nil
}
