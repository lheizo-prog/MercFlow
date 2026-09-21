// Mensagens trocadas no canal de WebSocket de lançamentos
// (GET /ws/lancamentos). O backend só emite eventos (não espera comandos do
// cliente), então o tipo cobre apenas o payload recebido.

export type LancamentoWSTipo = "novo_lancamento";

export interface LancamentoWSMessage {
  tipo: LancamentoWSTipo;
  dados?: unknown;
}

export function isLancamentoWSMessage(
  valor: unknown,
): valor is LancamentoWSMessage {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "tipo" in valor &&
    typeof (valor as { tipo: unknown }).tipo === "string"
  );
}
