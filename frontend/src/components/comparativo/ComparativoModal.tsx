import { useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useComparativo } from "../../../hooks/useComparativo";
import type { ComparativoConfig, ComparativoLojaSelecionada } from "../../../types/Comparativo";
import { ComparativoGraficos } from "./GraficosComparativo";
import { TabelaComparativa } from "./TabelaComparativa";
import { ExportarComparativo } from "./ExportarComparativo";
import { formatarDataHora, formatarRange } from "../../../utils/format";

type TipoGrafico = "barras" | "pizza";

interface VariacaoInfo { total: number; registros: number; novos: number; perdeu: number; }

const containerStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: "20px" };
const cardStyle: React.CSSProperties = { maxHeight: "90vh", overflowY: "auto", width: "100%", maxWidth: "1200px" };

export function ComparativoModal({ onClose }: { onClose: () => void }) {
  const { stage, lojas, loadingLojas, config, dadoA, dadoB, errors, modo, tipo, lojaA, lojaB, rangeA_2, rangeB_2, loja, rangeA_1, rangeB_1, submitting, setModo, setTipo, setLojaA, setLojaB, setRangeA_2, setRangeB_2, setLoja, setRangeA_1, setRangeB_1, handleSubmit, handleBackToFilters } = useComparativo();
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("barras");
  const [filtroProduto, setFiltroProduto] = useState("");

  const rankingA = useMemo(() => filtroProduto.trim() ? (dadoA?.ranking.filter((i) => i.produto.toLowerCase().includes(filtroProduto.toLowerCase())) ?? []) : (dadoA?.ranking ?? []), [dadoA, filtroProduto]);
  const rankingB = useMemo(() => filtroProduto.trim() ? (dadoB?.ranking.filter((i) => i.produto.toLowerCase().includes(filtroProduto.toLowerCase())) ?? []) : (dadoB?.ranking ?? []), [dadoB, filtroProduto]);

  const variacao = useMemo<VariacaoInfo | null>(() => {
    if (!config || config.modo !== "mesma_loja" || !dadoA || !dadoB) return null;
    if (dadoA.resumo.total_quantidade === 0) return { total: dadoB.resumo.total_quantidade > 0 ? 100 : 0, registros: dadoA.resumo.quantidade_registros, novos: 0, perdeu: 0 };
    const deltaTotal = ((dadoB.resumo.total_quantidade - dadoA.resumo.total_quantidade) / dadoA.resumo.total_quantidade) * 100;
    const idsA = new Set(dadoA.ranking.map((i) => i.produto_generico_id || i.produto_id));
    const idsB = new Set(dadoB.ranking.map((i) => i.produto_generico_id || i.produto_id));
    let novos = 0, perdeu = 0;
    idsB.forEach((id) => { if (!idsA.has(id)) novos++; });
    idsA.forEach((id) => { if (!idsB.has(id)) perdeu++; });
    return { total: deltaTotal, registros: dadoA.resumo.quantidade_registros, novos, perdeu };
  }, [config, dadoA, dadoB]);

  const { labelA, labelB, titulo, rangeA, rangeB } = useMemo(() => {
    if (config?.modo === "mesma_loja") return ["Periodo A","Periodo B", "Evolucao: " + config.loja.nome, config.rangeA, config.rangeB];
    if (config?.modo === "duas_lojas") return [config.lojaA.nome, config.lojaB.nome, config.lojaA.nome + " vs " + config.lojaB.nome, config.rangeA, config.rangeB];
    return ["","","", { dataInicio:"", dataFim:"" }, { dataInicio:"", dataFim:"" }];
  }, [config]);

  const lojaPorId = (id: number) => lojas.find((l) => l.id === id);