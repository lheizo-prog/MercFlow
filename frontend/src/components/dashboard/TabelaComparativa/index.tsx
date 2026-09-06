import { useMemo, useState } from "react";
import type { RankingItem } from "../../../types/Comparativo";

type ColunaOrdenacao = "produto" | "qtdA" | "qtdB" | "delta";

interface Props {
  rankingA: RankingItem[];
  rankingB: RankingItem[];
  labelA: string;
  labelB: string;
}

interface LinhaTabela {
  produto: string;
  produto_id: number;
  produto_generico_id: number;
  qtdA: number;
  qtdB: number;
  unidade: string;
  delta: number; // variacao absoluta
  deltaPct: number; // variacao percentual
}

function formatarPct(v: number): string {
  if (!isFinite(v)) return "-";
  const sinal = v > 0 ? "+" : "";
  return `${sinal}${v.toFixed(1)}%`;
}

function formatarDelta(v: number, unidade: string): string {
  if (v === 0) return "0";
  const sinal = v > 0 ? "+" : "";
  return `${sinal}${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unidade}`;
}

export function TabelaComparativa({ rankingA, rankingB, labelA, labelB }: Props) {
  const [ordenacao, setOrdenacao] = useState<ColunaOrdenacao>("qtdA");
  const [direcao, setDirecao] = useState<"asc" | "desc">("desc");
  const [busca, setBusca] = useState("");

  const linhas = useMemo<LinhaTabela[]>(() => {
    const mapa = new Map<string, LinhaTabela>();
    const getKey = (it: RankingItem) =>
      `${it.produto_generico_id || it.produto_id}-${it.unidade}`;

    rankingA.forEach((it) => {
      const key = getKey(it);
      const existente = mapa.get(key);
      if (existente) {
        existente.qtdA = it.quantidade;
      } else {
        mapa.set(key, {
          produto: it.produto,
          produto_id: it.produto_id,
          produto_generico_id: it.produto_generico_id,
          qtdA: it.quantidade,
          qtdB: 0,
          unidade: it.unidade,
          delta: 0,
          deltaPct: 0,
        });
      }
    });

    rankingB.forEach((it) => {
      const key = getKey(it);
      const existente = mapa.get(key);
      if (existente) {
        existente.qtdB = it.quantidade;
      } else {
        mapa.set(key, {
          produto: it.produto,
          produto_id: it.produto_id,
          produto_generico_id: it.produto_generico_id,
          qtdA: 0,
          qtdB: it.quantidade,
          unidade: it.unidade,
          delta: 0,
          deltaPct: 0,
        });
      }
    });

    const resultado = Array.from(mapa.values()).map((l) => {
      l.delta = l.qtdB - l.qtdA;
      l.deltaPct = l.qtdA > 0 ? ((l.qtdB - l.qtdA) / l.qtdA) * 100 : (l.qtdB > 0 ? 100 : 0);
      return l;
    });

    return resultado;
  }, [rankingA, rankingB]);

  const linhasFiltradas = useMemo(() => {
    const filtradas = busca.trim()
      ? linhas.filter((l) => l.produto.toLowerCase().includes(busca.toLowerCase()))
      : linhas;

    return [...filtradas].sort((a, b) => {
      const dir = direcao === "desc" ? -1 : 1;
      switch (ordenacao) {
        case "produto": return a.produto.localeCompare(b.produto) * dir;
        case "qtdA": return (a.qtdA - b.qtdA) * dir;
        case "qtdB": return (a.qtdB - b.qtdB) * dir;
        case "delta": return (a.delta - b.delta) * dir;
      }
    });
  }, [linhas, busca, ordenacao, direcao]);

  function alternarOrdenacao(col: ColunaOrdenacao) {
    if (ordenacao === col) {
      setDirecao(direcao === "asc" ? "desc" : "asc");
    } else {
      setOrdenacao(col);
      setDirecao(col === "produto" ? "asc" : "desc");
    }
  }

  function setaOrdenacao(col: ColunaOrdenacao) {
    if (ordenacao !== col) return null;
    return direcao === "asc" ? " ↑" : " ↓";
  }

  function classeDelta(delta: number) {
    if (delta > 0) return "text-success";
    if (delta < 0) return "text-danger";
    return "text-body-secondary";
  }

  if (linhas.length === 0) {
    return (
      <div className="text-center text-body-secondary py-4">
        Nenhum produto encontrado em ambas as listas
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3">
        <h6 className="mb-0 d-flex align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="me-2">
            <path d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zM5 10.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
            <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
          </svg>
          Tabela Comparativa ({linhasFiltradas.length} de {linhas.length} produtos)
        </h6>
        <div className="position-relative" style={{ minWidth: "220px" }}>
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
        <table className="table table-sm table-hover align-middle mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th
                role="button"
                onClick={() => alternarOrdenacao("produto")}
                style={{ cursor: "pointer", minWidth: "180px" }}
              >
                Produto{setaOrdenacao("produto")}
              </th>
              <th
                role="button"
                onClick={() => alternarOrdenacao("qtdA")}
                className="text-end"
                style={{ cursor: "pointer" }}
              >
                {labelA}{setaOrdenacao("qtdA")}
              </th>
              <th
                role="button"
                onClick={() => alternarOrdenacao("qtdB")}
                className="text-end"
                style={{ cursor: "pointer" }}
              >
                {labelB}{setaOrdenacao("qtdB")}
              </th>
              <th
                role="button"
                onClick={() => alternarOrdenacao("delta")}
                className="text-end"
                style={{ cursor: "pointer" }}
              >
                Variacao{setaOrdenacao("delta")}
              </th>
            </tr>
          </thead>
          <tbody>
            {linhasFiltradas.map((l) => (
              <tr key={`${l.produto_generico_id || l.produto_id}-${l.unidade}`}>
                <td className="text-truncate" style={{ maxWidth: "220px" }} title={l.produto}>
                  {l.produto}
                </td>
                <td className="text-end text-nowrap">
                  {l.qtdA.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} <span className="text-body-secondary small">{l.unidade}</span>
                </td>
                <td className="text-end text-nowrap">
                  {l.qtdB.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} <span className="text-body-secondary small">{l.unidade}</span>
                </td>
                <td className={`text-end text-nowrap fw-semibold ${classeDelta(l.delta)}`}>
                  <div>{formatarDelta(l.delta, l.unidade)}</div>
                  <div className="small">{formatarPct(l.deltaPct)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

