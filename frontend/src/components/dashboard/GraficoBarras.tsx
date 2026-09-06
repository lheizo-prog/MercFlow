import type { DashboardLancamentoRankingItem } from "../../types/Dashboard";
import { ComparativoGraficos } from "./ComparativoGraficos";

interface Props { ranking: DashboardLancamentoRankingItem[]; titulo?: string; }

export function GraficoBarras({ ranking, titulo = "Ranking" }: Props) {
  return (
    <div className="mb-4">
      <h6 className="text-body-secondary small fw-semibold mb-3">{titulo}</h6>
      <ComparativoGraficos tipo="barras" ranking={ranking} label="Quantidade" cor="rgba(13, 110, 253, 0.7)" altura={300} />
    </div>
  );
}
