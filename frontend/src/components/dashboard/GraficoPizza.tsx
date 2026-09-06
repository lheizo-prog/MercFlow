import type { DashboardLancamentoRankingItem } from "../../types/Dashboard";
import { ComparativoGraficos } from "./ComparativoGraficos";

interface Props { ranking: DashboardLancamentoRankingItem[]; titulo?: string; }

export function GraficoPizza({ ranking, titulo = "Distribuicao" }: Props) {
  return (
    <div className="mb-4">
      <h6 className="text-body-secondary small fw-semibold mb-3">{titulo}</h6>
      <ComparativoGraficos tipo="pizza" ranking={ranking} label="Quantidade" cor="rgba(25, 135, 84, 0.7)" altura={320} />
    </div>
  );
}
