import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, type ChartOptions, type TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type RankingItem = { produto_id: number; produto_generico_id: number; produto: string; quantidade: number; unidade: string; };
interface Props { ranking: RankingItem[]; titulo?: string; }

export function GraficoBarras({ ranking, titulo = "Ranking" }: Props) {
  const dados = ranking.slice(0, 10);
  const data = {
    labels: dados.map((i) => i.produto.length > 20 ? i.produto.substring(0, 20) + "..." : i.produto),
    datasets: [{ label: "Quantidade", data: dados.map((i) => i.quantidade), backgroundColor: "rgba(13, 110, 253, 0.6)", borderColor: "rgba(13, 110, 253, 1)", borderWidth: 2, borderRadius: 6 }],
  };
  const options: ChartOptions<"bar"> = {
    indexAxis: "y", responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!titulo, text: titulo, font: { size: 14, weight: "bold" }, padding: { bottom: 16 } },
      tooltip: { backgroundColor: "rgba(0, 0, 0, 0.85)", padding: 12, cornerRadius: 8, callbacks: { label: (ctx: TooltipItem<"bar">) => `${dados[ctx.dataIndex].quantidade.toLocaleString("pt-BR")} ${dados[ctx.dataIndex].unidade}` } },
    },
    scales: { x: { grid: { color: "rgba(0, 0, 0, 0.05)" }, ticks: { font: { size: 11 } } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } },
    animation: { duration: 800 },
  };
  return <div style={{ height: dados.length > 0 ? Math.max(300, dados.length * 40) : 300 }}><Bar data={data} options={options} /></div>;
}
