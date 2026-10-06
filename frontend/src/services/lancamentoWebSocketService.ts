import { isLancamentoWSMessage } from "../types/WebSocket";
import type { LancamentoWSMessage } from "../types/WebSocket";
import api from "./api";

export type LancamentoWSStatus = "connecting" | "open" | "closed";

export interface ConnectLancamentoWSOptions {
  onMessage: (mensagem: LancamentoWSMessage) => void;
  onError?: (event: Event) => void;
  onStatusChange?: (status: LancamentoWSStatus) => void;
}

export interface LancamentoWSConnection {
  disconnect: () => void;
}

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

// getWSUrl monta a URL de WebSocket a partir da mesma base usada pelo axios
// (VITE_API_URL, ou o prefixo relativo "/api" atendido pelo proxy do Vite em
// dev / pelo reverse proxy em produção), trocando o protocolo http(s) por
// ws(s) — WebSocket não aceita URLs http(s).
function getWSUrl(path: string): string {
  const apiBase = import.meta.env.VITE_API_URL as string | undefined;

  if (apiBase) {
    const url = new URL(apiBase, window.location.origin);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
    return url.toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api${path}`;
}

/**
 * Abre uma conexão WebSocket com o endpoint de eventos de lançamento,
 * reconectando automaticamente (backoff exponencial: 1s, 2s, 4s... até 30s)
 * caso a conexão caia. O token é lido do localStorage a cada tentativa de
 * conexão (incluindo reconexões), para refletir logins/logouts sem exigir
 * que o chamador recrie a conexão manualmente.
 *
 * Retorna um objeto com `disconnect()`, que deve ser chamado ao desmontar o
 * componente ou fazer logout, para encerrar a conexão e cancelar qualquer
 * reconexão agendada.
 */
export function connectLancamentoWS(
  options: ConnectLancamentoWSOptions,
): LancamentoWSConnection {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;
  let manuallyClosed = false;

  function scheduleReconnect() {
    if (manuallyClosed) return;
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** attempt,
      RECONNECT_MAX_DELAY_MS,
    );
    attempt += 1;
    reconnectTimer = setTimeout(connect, delay);
  }

  async function connect() {
    if (manuallyClosed) return;

    const token = localStorage.getItem("mercflow_token");
    if (!token) {
      // Sem sessão ativa no momento; tenta novamente mais tarde (o usuário
      // pode fazer login enquanto o componente já está montado).
      scheduleReconnect();
      return;
    }

    options.onStatusChange?.("connecting");

    let ticket: string | null = null;
    try {
      const res = await api.post<{ ticket: string }>("/ws/ticket");
      ticket = res.data.ticket;
    } catch {
      // Se falhar a emissão do ticket, tenta reconectar com delay
      scheduleReconnect();
      return;
    }

    if (manuallyClosed) return;

    const url = new URL(getWSUrl("/ws/lancamentos"));
    url.searchParams.set("ticket", ticket);
    const lojaId = localStorage.getItem("mercflow_loja_id");
    if (lojaId) {
      url.searchParams.set("loja_id", lojaId);
    }

    const ws = new WebSocket(url.toString());
    socket = ws;

    ws.onopen = () => {
      attempt = 0;
      options.onStatusChange?.("open");
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed: unknown = JSON.parse(event.data);
        if (isLancamentoWSMessage(parsed)) {
          options.onMessage(parsed);
        }
      } catch {
        // Ignora mensagens que não são JSON válido.
      }
    };

    ws.onerror = (event) => {
      options.onError?.(event);
    };

    ws.onclose = () => {
      socket = null;
      options.onStatusChange?.("closed");
      scheduleReconnect();
    };
  }

  connect();

  return {
    disconnect() {
      manuallyClosed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (socket) {
        // Evita que o onclose dispare uma reconexão após um fechamento
        // intencional.
        socket.onclose = null;
        socket.close();
        socket = null;
      }
    },
  };
}
