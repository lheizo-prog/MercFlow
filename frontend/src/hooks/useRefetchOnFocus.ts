import { useEffect, useRef } from "react";

export interface UseRefetchOnFocusOptions {
  /** Quando false, nenhum listener é registrado (ex.: usuário não autenticado). */
  enabled?: boolean;
  /** Intervalo mínimo entre refetches disparados por foco, em ms. */
  minIntervalMs?: number;
}

/**
 * Recarrega dados sempre que a aba volta a ficar visível ou a janela recupera
 * o foco. Cobre o caso em que outra aba, outro usuário ou outra sessão altera
 * um dado (ex.: exclui um produto) enquanto esta página segue aberta com uma
 * lista carregada apenas uma vez no mount — sem isso, a lista fica
 * "congelada" mostrando itens que já não existem mais no backend.
 *
 * `refetch` é guardado em uma ref interna, então passar uma nova função a
 * cada render não recria os listeners.
 */
export function useRefetchOnFocus(
  refetch: () => void,
  { enabled = true, minIntervalMs = 15000 }: UseRefetchOnFocusOptions = {},
): void {
  const refetchRef = useRef(refetch);
  const lastRunRef = useRef(0);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!enabled) return;

    function runRefetch() {
      const now = Date.now();
      if (now - lastRunRef.current < minIntervalMs) return;
      lastRunRef.current = now;
      refetchRef.current();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        runRefetch();
      }
    }

    window.addEventListener("focus", runRefetch);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", runRefetch);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, minIntervalMs]);
}
