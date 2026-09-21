import { useEffect, useRef } from "react";
import {
  connectLancamentoWS,
  type LancamentoWSStatus,
} from "../services/lancamentoWebSocketService";
import type { LancamentoWSMessage } from "../types/WebSocket";

export interface UseLancamentoWebSocketOptions {
  /** Quando false, nenhuma conexão é aberta (ex.: usuário não autenticado). */
  enabled?: boolean;
  /** Chamado sempre que um evento "novo_lancamento" chega. */
  onNovoLancamento: () => void;
  /** Opcional: acompanhar o status da conexão (ex.: indicador na UI). */
  onStatusChange?: (status: LancamentoWSStatus) => void;
}

/**
 * Mantém uma conexão WebSocket com o endpoint de eventos de lançamento e
 * dispara `onNovoLancamento` a cada novo lançamento criado por qualquer
 * usuário da mesma loja.
 *
 * `onNovoLancamento` é guardado em uma ref interna, então passar uma nova
 * função a cada render (comum quando ela depende de filtros locais) não
 * derruba e reabre a conexão — só o valor de `enabled` faz isso.
 */
export function useLancamentoWebSocket({
  enabled = true,
  onNovoLancamento,
  onStatusChange,
}: UseLancamentoWebSocketOptions): void {
  const onNovoLancamentoRef = useRef(onNovoLancamento);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onNovoLancamentoRef.current = onNovoLancamento;
    onStatusChangeRef.current = onStatusChange;
  }, [onNovoLancamento, onStatusChange]);

  useEffect(() => {
    if (!enabled) return;

    const connection = connectLancamentoWS({
      onMessage: (mensagem: LancamentoWSMessage) => {
        if (mensagem.tipo === "novo_lancamento") {
          onNovoLancamentoRef.current();
        }
      },
      onStatusChange: (status) => onStatusChangeRef.current?.(status),
    });

    return () => connection.disconnect();
  }, [enabled]);
}
