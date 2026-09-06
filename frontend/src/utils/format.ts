export function formatarData(data: string, fallback = "todo o periodo"): string {
  if (!data) return fallback;
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function formatarDataHora(data: Date = new Date()): string {
  const d = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const h = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${d} as ${h}`;
}
