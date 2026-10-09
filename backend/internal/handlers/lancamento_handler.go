package handlers

import (
	"MercFlow/internal/auth"
	request "MercFlow/internal/models/requests"
	"MercFlow/internal/service"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type LancamentoHandler struct {
	service *service.LancamentoService
	hub     *WSHub
}

func NovoLancamentoHandler(s *service.LancamentoService, hub *WSHub) *LancamentoHandler {
	return &LancamentoHandler{
		service: s,
		hub:     hub,
	}
}

func (h *LancamentoHandler) HandleLancamentos(router gin.IRouter) {
	lancamentos := router.Group("/lancamentos")

	lancamentos.GET("", auth.RequirePermission("lancamento.read"), h.Listar)
	lancamentos.POST("", auth.RequirePermission("lancamento.create"), h.Criar)
	lancamentos.POST("/scan-etiquetas", auth.RequirePermission("lancamento.create"), h.ScanEtiquetas)
	lancamentos.GET("/conversao", auth.RequirePermission("lancamento.calculate"), h.CalcularConversao)
	lancamentos.GET("/:id", auth.RequirePermission("lancamento.read"), h.BuscarID)
}

// HandleLancamentosWS registra o endpoint de WebSocket. Deve ser montado no
// router raiz (fora do grupo `protected`), pois usa autenticação por token na
// query string em vez do header Authorization — o AuthMiddleware baseado em
// header rejeitaria o handshake antes mesmo de chegar aqui, já que o
// WebSocket dos navegadores não permite enviar headers customizados.
func (h *LancamentoHandler) HandleLancamentosWS(router gin.IRouter) {
	router.GET("/ws/lancamentos", auth.WSAuthMiddleware(), auth.RequirePermission("lancamento.read"), h.WS)
}

func (h *LancamentoHandler) Criar(ctx *gin.Context) {
	var lancamento request.LancamentoRequest

	err := ctx.BindJSON(&lancamento)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "JSON inválido",
		})
		return
	}

	lojaID, ok := lojaParaCriacao(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	lancamentoCriado, err := h.service.Criar(&lancamento, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	h.notificarNovoLancamento(lojaID, lancamentoCriado)

	ctx.JSON(201, lancamentoCriado)
}

// notificarNovoLancamento envia um evento de broadcast para os clientes
// WebSocket conectados na loja indicada, informando que um novo lançamento
// foi criado. Silenciosamente ignora falhas de notificação: a criação do
// lançamento já foi persistida e não deve falhar por causa do WebSocket.
func (h *LancamentoHandler) notificarNovoLancamento(lojaID int, lancamento interface{}) {
	if h.hub == nil {
		return
	}

	msg, err := json.Marshal(gin.H{
		"tipo":  "novo_lancamento",
		"dados": lancamento,
	})
	if err != nil {
		return
	}

	h.hub.Broadcast(lojaID, msg)
}

func (h *LancamentoHandler) Listar(ctx *gin.Context) {
	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	lista, err := h.service.Listar(lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func (h *LancamentoHandler) BuscarID(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID inválido",
		})
		return
	}

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	lancamento, err := h.service.BuscarID(id, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, lancamento)
}

func (h *LancamentoHandler) CalcularConversao(ctx *gin.Context) {
	produtoMID, err := strconv.Atoi(ctx.Query("produto_m_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "produto_m_id inválido",
		})
		return
	}

	produtoDID, err := strconv.Atoi(ctx.Query("produto_d_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "produto_d_id inválido",
		})
		return
	}

	item := request.LancamentoItem{
		ProdutoMerceariaID:    &produtoMID,
		ProdutoDepartamentoID: &produtoDID,
	}

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	resultado, err := h.service.CalcularConversao(item, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, resultado)
}

const (
	wsWriteWait      = 10 * time.Second
	wsPongWait       = 60 * time.Second
	wsPingPeriod     = (wsPongWait * 9) / 10
	wsMaxMessageSize = 512
)

var wsUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     checkWSOrigin,
}

// checkWSOrigin restringe o handshake de WebSocket à mesma origem permitida
// pelo CORS (FRONTEND_URL). Clientes sem header Origin (ferramentas de
// linha de comando como wscat, apps mobile) são aceitos, já que só
// navegadores enviam esse header automaticamente e é justamente contra
// navegadores de outras origens que essa checagem protege.
func checkWSOrigin(r *http.Request) bool {
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	if origin == "" {
		return true
	}

	frontendURL := strings.TrimSpace(os.Getenv("FRONTEND_URL"))
	if frontendURL == "" {
		// Sem FRONTEND_URL configurado, nenhuma origem de navegador é
		// confiável — mesmo comportamento conservador do middleware CORS.
		return false
	}

	return origin == frontendURL
}

// WS faz o upgrade da conexão HTTP para WebSocket e registra o cliente no
// hub, restrito à loja do usuário autenticado. Cada cliente ganha duas
// goroutines: uma de leitura (apenas para detectar desconexão e responder a
// pings) e uma de escrita (que entrega as mensagens de broadcast).
func (h *LancamentoHandler) WS(ctx *gin.Context) {
	lojaID, ok := lojaParaWS(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}

	conn, err := wsUpgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		return
	}

	client := &WSClient{conn: conn, send: make(chan []byte, 256), LojaID: lojaID}
	h.hub.register <- client

	go h.writePump(client)
	go h.readPump(client)
}

// readPump apenas consome mensagens do cliente (este endpoint não processa
// comandos vindos do front) e detecta o fechamento da conexão. Também
// mantém o prazo de pong atualizado para o keep-alive funcionar.
func (h *LancamentoHandler) readPump(client *WSClient) {
	defer func() {
		h.hub.unregister <- client
		client.conn.Close()
	}()

	client.conn.SetReadLimit(wsMaxMessageSize)
	client.conn.SetReadDeadline(time.Now().Add(wsPongWait))
	client.conn.SetPongHandler(func(string) error {
		client.conn.SetReadDeadline(time.Now().Add(wsPongWait))
		return nil
	})

	for {
		if _, _, err := client.conn.ReadMessage(); err != nil {
			break
		}
	}
}

// writePump entrega mensagens de broadcast ao cliente e envia pings
// periódicos para manter a conexão viva atrás de proxies/load balancers.
func (h *LancamentoHandler) writePump(client *WSClient) {
	ticker := time.NewTicker(wsPingPeriod)
	defer func() {
		ticker.Stop()
		client.conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.send:
			client.conn.SetWriteDeadline(time.Now().Add(wsWriteWait))
			if !ok {
				client.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := client.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			client.conn.SetWriteDeadline(time.Now().Add(wsWriteWait))
			if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *LancamentoHandler) ScanEtiquetas(ctx *gin.Context) {
	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}

	fileHeader, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "arquivo de imagem não informado"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "não foi possível abrir o arquivo de imagem"})
		return
	}
	defer file.Close()

	imageBytes := make([]byte, fileHeader.Size)
	if _, err := file.Read(imageBytes); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "erro ao ler bytes da imagem"})
		return
	}

	departamentoID := 0
	if depStr := ctx.PostForm("departamento_id"); depStr != "" {
		if id, err := strconv.Atoi(depStr); err == nil {
			departamentoID = id
		}
	}

	tipoLancamento := strings.ToUpper(strings.TrimSpace(ctx.PostForm("tipo")))

	resultado, err := h.service.ScanEtiquetas(imageBytes, fileHeader.Filename, lojaID, departamentoID, tipoLancamento)
	if err != nil {
		ResponderErro(ctx, err, "não foi possível processar a imagem das etiquetas")
		return
	}

	ctx.JSON(http.StatusOK, resultado)
}

