import { useMemo } from "react";
import type { DashboardLancamentoRankingItem as RankingItem } from "../../../types/Dashboard";
import type { ChartOptions, TooltipItem } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

type GraficoTipo = "barras" | "pizza";

interface Props {
  tipo: GraficoTipo;
  ranking: RankingItem[];
  label: string;
  cor: string;
  altura?: number;
}

const coresPizza = [
  "rgba(13, 110, 253, 0.85)",
  "rgba(25, 135, 84, 0.85)",
  "rgba(253, 126, 20, 0.85)",
  "rgba(220, 53, 69, 0.85)",
  "rgba(111, 66, 193, 0.85)",
  "rgba(32, 201, 151, 0.85)",
  "rgba(214, 51, 132, 0.85)",
  "rgba(108, 117, 125, 0.85)",
];

export function ComparativoGraficos({ tipo, ranking, label, cor, altura = 280 }: Props) {
  const dados = useMemo(() => ranking.slice(0, 10), [ranking]);

  if (dados.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center text-body-secondary" style={{ height: altura }}>
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16" className="mb-2 opacity-25">
            <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
          </svg>
          <p className="small mb-0">Sem dados para exibir</p>
        </div>
      </div>
    );
  }

  if (tipo === "barras") {
    const data = {
      labels: dados.map((i) =>
        i.produto.length > 22 ? i.produto.substring(0, 22) + "..." : i.produto
      ),
      datasets: [{
        label,
        data: dados.map((i) => i.quantidade),
        backgroundColor: cor,
        borderColor: cor.replace("0.7", "1").replace("0.85", "1"),
        borderWidth: 2,
        borderRadius: 6,
      }],
    };

    const options: ChartOptions<"bar"> = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${dados[ctx.dataIndex].quantidade.toLocaleString("pt-BR")} ${dados[ctx.dataIndex].unidade}`,
          },
        },
      },
      scales: {
        x: { grid: { color: "rgba(0, 0, 0, 0.05)" }, ticks: { font: { size: 11 } } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
      animation: { duration: 800 },
    };

    return (
      <div style={{ height: altura }}>
        <Bar data={data} options={options} />
      </div>
    );
  }

  const total = dados.reduce((s, i) => s + i.quantidade, 0);
  const data = {
    labels: dados.map((i) =>
      i.produto.length > 18 ? i.produto.substring(0, 18) + "..." : i.produto
    ),
    datasets: [{
      data: dados.map((i) => i.quantidade),
      backgroundColor: dados.map((_, j) => coresPizza[j % coresPizza.length]),
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "55%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 12,
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 10 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<"doughnut">) => {
            const v = ctx.raw as number;
            const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0";
            return [
              `${v.toLocaleString("pt-BR")} ${dados[ctx.dataIndex].unidade}`,
              `Participacao: ${pct}%`,
            ];
          },
        },
      },
    },
    animation: { animateRotate: true, animateScale: true, duration: 800 },
  };

  return (
    <div style={{ height: altura }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
