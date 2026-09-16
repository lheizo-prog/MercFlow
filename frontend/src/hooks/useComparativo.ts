import { useState, useEffect, useCallback } from "react";
import dashboardService from "../services/dashboardService";
import lojaService from "../services/lojaService";
import type { Loja } from "../types/Loja";
import type {
  ComparativoConfig,
  ComparativoDuasLojasConfig,
  ComparativoMesmaLojaConfig,
  ComparativoLojaData,
  ComparativoRange,
  ComparativoLojaSelecionada,
  RankingItem,
} from "../types/Comparativo";

type Stage = "filters" | "loading" | "results";

interface UseComparativoReturn {
  stage: Stage;
  lojas: Loja[];
  loadingLojas: boolean;
  config: ComparativoConfig | null;
  dadoA: ComparativoLojaData | null;
  dadoB: ComparativoLojaData | null;
  error: string | null;
  modo: "duas_lojas" | "mesma_loja";
  tipo: "" | "QUEBRA" | "TRANSFERENCIA";
  lojaA: ComparativoLojaSelecionada | undefined;
  lojaB: ComparativoLojaSelecionada | undefined;
  rangeA_2: ComparativoRange;
  rangeB_2: ComparativoRange;
  loja: ComparativoLojaSelecionada | undefined;
  rangeA_1: ComparativoRange;
  rangeB_1: ComparativoRange;
  errors: Record<string, string>;
  submitting: boolean;
  setModo: (v: "duas_lojas" | "mesma_loja") => void;
  setTipo: (v: "" | "QUEBRA" | "TRANSFERENCIA") => void;
  setLojaA: (v: ComparativoLojaSelecionada | undefined) => void;
  setLojaB: (v: ComparativoLojaSelecionada | undefined) => void;
  setRangeA_2: (v: ComparativoRange) => void;
  setRangeB_2: (v: ComparativoRange) => void;
  setLoja: (v: ComparativoLojaSelecionada | undefined) => void;
  setRangeA_1: (v: ComparativoRange) => void;
  setRangeB_1: (v: ComparativoRange) => void;
  handleSubmit: () => void;
  handleBackToFilters: () => void;
  resetForm: () => void;
}

const rangeVazio: ComparativoRange = { dataInicio: "", dataFim: "" };

function vazioLojaData(lojaId: number, lojaNome: string, range: ComparativoRange, tipo: string): ComparativoLojaData {
  return { loja_id: lojaId, loja_nome: lojaNome, tipo, range, resumo: { total_quantidade: 0, quantidade_registros: 0 }, ranking: [], produtos_distintos: 0, loading: true, error: null };
}

export function useComparativo(): UseComparativoReturn {
  // Estados internos
  const [stage, setStage] = useState<Stage>("filters");
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(true);
  const [config, setConfig] = useState<ComparativoConfig | null>(null);
  const [dadoA, setDadoA] = useState<ComparativoLojaData | null>(null);
  const [dadoB, setDadoB] = useState<ComparativoLojaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<"duas_lojas" | "mesma_loja">("duas_lojas");
  const [tipo, setTipo] = useState<"" | "QUEBRA" | "TRANSFERENCIA">("");
  const [lojaA, setLojaA] = useState<ComparativoLojaSelecionada | undefined>();
  const [lojaB, setLojaB] = useState<ComparativoLojaSelecionada | undefined>();
  const [rangeA_2, setRangeA_2] = useState<ComparativoRange>(rangeVazio);
  const [rangeB_2, setRangeB_2] = useState<ComparativoRange>(rangeVazio);
  const [loja, setLoja] = useState<ComparativoLojaSelecionada | undefined>();
  const [rangeA_1, setRangeA_1] = useState<ComparativoRange>(rangeVazio);
  const [rangeB_1, setRangeB_1] = useState<ComparativoRange>(rangeVazio);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Carregar lojas ao entrar no estágio de filtros
  useEffect(() => {
    if (stage === "filters") {
      setLoadingLojas(true);
      lojaService
        .listar()
        .then((res) => setLojas(res.filter((l) => l.ativo)))
        .catch(() => setLojas([]))
        .finally(() => setLoadingLojas(false));
    }
  }, [stage]);

  // Limpar erros ao mudar de estágio
  useEffect(() => {
    if (stage === "filters") {
      setErrors({});
      setSubmitting(false);
    }
  }, [stage]);

  const carregarDados = useCallback(async (cfg: ComparativoConfig) => {
    setStage("loading");
    setError(null);

    function buildLojas(): Array<{ id: number; nome: string; range: ComparativoRange }> {
      if (cfg.modo === "duas_lojas") {
        const c = cfg as ComparativoDuasLojasConfig;
        return [
          { id: c.lojaA.id, nome: c.lojaA.nome, range: c.rangeA },
          { id: c.lojaB.id, nome: c.lojaB.nome, range: c.rangeB },
        ];
      } else {
        const c = cfg as ComparativoMesmaLojaConfig;
        return [
          { id: c.loja.id, nome: c.loja.nome, range: c.rangeA },
          { id: c.loja.id, nome: c.loja.nome, range: c.rangeB },
        ];
      }
    }

    const lojas = buildLojas();
    const [a, b] = lojas;

    setDadoA(vazioLojaData(a.id, a.nome, a.range, cfg.tipo));
    setDadoB(vazioLojaData(b.id, b.nome, b.range, cfg.tipo));

    try {
      const [resA, resB] = await Promise.all([
        dashboardService.buscarLancamentos({
          data_inicio: a.range.dataInicio || undefined,
          data_fim: a.range.dataFim || undefined,
          tipo: cfg.tipo || undefined,
          loja_ids: String(a.id),
        }),
        dashboardService.buscarLancamentos({
          data_inicio: b.range.dataInicio || undefined,
          data_fim: b.range.dataFim || undefined,
          tipo: cfg.tipo || undefined,
          loja_ids: String(b.id),
        }),
      ]);

      const processar = (res: typeof resA, id: number, nome: string): ComparativoLojaData => {
        const ranking: RankingItem[] = res.ranking ?? [];
        return {
          loja_id: id, loja_nome: nome, tipo: cfg.tipo,
          range: cfg.modo === "duas_lojas" ? (cfg as ComparativoDuasLojasConfig).rangeA : (cfg as ComparativoMesmaLojaConfig).rangeA,
          resumo: res.resumo, ranking,
          produtos_distintos: new Set(ranking.map((r) => r.produto_generico_id || r.produto_id)).size,
          loading: false, error: null,
        };
      };

      setDadoA(processar(resA, a.id, a.nome));
      setDadoB(processar(resB, b.id, b.nome));
      setConfig(cfg);
      setStage("results");
    } catch {
      setError("Erro ao buscar dados do comparativo.");
      setStage("results");
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const errs: Record<string, string> = {};

    if (modo === "duas_lojas") {
      if (!lojaA) errs.lojaA = "Selecione a Loja A";
      if (!lojaB) errs.lojaB = "Selecione a Loja B";
      if (lojaA && lojaB && lojaA.id === lojaB.id) errs.lojaB = "As lojas devem ser diferentes";
      if (!rangeA_2.dataInicio) errs.rangeA_2 = "Informe a data de início";
      if (rangeA_2.dataInicio && rangeA_2.dataFim && rangeA_2.dataFim < rangeA_2.dataInicio) errs.rangeA_2 = "Data fim deve ser maior que início";
      if (!rangeB_2.dataInicio) errs.rangeB_2 = "Informe a data de início";
      if (rangeB_2.dataInicio && rangeB_2.dataFim && rangeB_2.dataFim < rangeB_2.dataInicio) errs.rangeB_2 = "Data fim deve ser maior que início";
    } else {
      if (!loja) errs.loja = "Selecione a loja";
      if (!rangeA_1.dataInicio) errs.rangeA_1 = "Informe a data de início do Período A";
      if (rangeA_1.dataInicio && rangeA_1.dataFim && rangeA_1.dataFim < rangeA_1.dataInicio) errs.rangeA_1 = "Data fim deve ser maior que início";
      if (!rangeB_1.dataInicio) errs.rangeB_1 = "Informe a data de início do Período B";
      if (rangeB_1.dataInicio && rangeB_1.dataFim && rangeB_1.dataFim < rangeB_1.dataInicio) errs.rangeB_1 = "Data fim deve ser maior que início";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    const cfg: ComparativoConfig = modo === "duas_lojas"
      ? { modo: "duas_lojas", tipo, lojaA: lojaA!, lojaB: lojaB!, rangeA: rangeA_2, rangeB: rangeB_2 }
      : { modo: "mesma_loja", tipo, loja: loja!, rangeA: rangeA_1, rangeB: rangeB_1 };

    carregarDados(cfg);
    setSubmitting(false);
  }, [modo, tipo, lojaA, lojaB, rangeA_2, rangeB_2, loja, rangeA_1, rangeB_1, carregarDados]);

  const handleBackToFilters = useCallback(() => setStage("filters"), []);

  const resetForm = useCallback(() => {
    setModo("duas_lojas");
    setTipo("");
    setLojaA(undefined);
    setLojaB(undefined);
    setRangeA_2(rangeVazio);
    setRangeB_2(rangeVazio);
    setLoja(undefined);
    setRangeA_1(rangeVazio);
    setRangeB_1(rangeVazio);
    setErrors({});
    setConfig(null);
    setDadoA(null);
    setDadoB(null);
    setStage("filters");
  }, []);

  return { stage, lojas, loadingLojas, config, dadoA, dadoB, error, modo, tipo, lojaA, lojaB, rangeA_2, rangeB_2, loja, rangeA_1, rangeB_1, errors, submitting, setModo, setTipo, setLojaA, setLojaB, setRangeA_2, setRangeB_2, setLoja, setRangeA_1, setRangeB_1, handleSubmit, handleBackToFilters, resetForm };
}
