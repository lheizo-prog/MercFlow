import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions, type TooltipItem } from "chart.js";
import { Doughnut } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);

type RankingItem = { produto_id: number; produto_generico_id: number; produto: string; quantidade: number; unidade: string; };
interface Props { ranking: RankingItem[]; titulo?: string; }

const cores = ["rgba(13, 110, 253, 0.8)", "rgba(25, 135, 84, 0.8)", "rgba(253, 126, 20, 0.8)", "rgba(220, 53, 69, 0.8)", "rgba(111, 66, 193, 0.8)", "rgba(32, 201, 151, 0.8)", "rgba(214, 51, 132, 0.8)", "rgba(108, 117, 125, 0.8)"];

export function GraficoPizza({ ranking, titulo = "Distribuição" }: Props) {
  const dados = ranking.slice(0, 8);
  const total = dados.reduce((s, i) => s + i.quantidade, 0);
  const data = {
    labels: dados.map((i) => i.produto.length > 18 ? i.produto.substring(0, 18) + "..." : i.produto),
    datasets: [{ data: dados.map((i) => i.quantidade), backgroundColor: dados.map((_, j) => cores[j % cores.length]), borderWidth: 2, hoverOffset: 8 }],
  };
  const options: ChartOptions<"doughnut"> = {
    responsive: true, maintainAspectRatio: false, cutout: "50%",
    plugins: {
      legend: { position: "right", labels: { padding: 16, usePointStyle: true, pointStyle: "circle", font: { size: 11 } } },
      title: { display: !!titulo, text: titulo, font: { size: 14, weight: "bold" }, padding: { bottom: 16 } },
      tooltip: { backgroundColor: "rgba(0, 0, 0, 0.85)", padding: 12, cornerRadius: 8, callbacks: { label: (ctx: TooltipItem<"doughnut">) => { const v = ctx.raw as number; const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0"; return [`${v.toLocaleString("pt-BR")} ${dados[ctx.dataIndex].unidade}`, `Participação: ${pct}%`]; } } },
    },
    animation: { animateRotate: true, animateScale: true, duration: 800 },
  };
  return <div style={{ height: 320 }}><Doughnut data={data} options={options} /></div>;
}
