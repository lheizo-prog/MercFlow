import { useMemo, useState } from "react";

import type { ProdutoGenerico } from "../../../types/ProdutoGenerico";

interface TabelaProdutosProps {
  produtos: ProdutoGenerico[];
  onEditar: (produto: ProdutoGenerico) => void;
  onExcluir: (id: number) => void;
}

type OrdenacaoDirecao = "asc" | "desc";
type OrdenacaoCampo = "id" | "nome" | "codigo";

function TabelaProdutos({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosProps) {
  const [ordenacao, setOrdenacao] = useState<{
    campo: OrdenacaoCampo;
    direcao: OrdenacaoDirecao;
  } | null>(null);

  const produtosOrdenados = useMemo(() => {
    if (!ordenacao) {
      return produtos;
    }

    const copia = [...produtos];
    const direcao = ordenacao.direcao === "asc" ? 1 : -1;

    copia.sort((a, b) => {
      const valorA =
        ordenacao.campo === "id"
          ? String(a.id ?? "")
          : (a[ordenacao.campo] ?? "").toString();
      const valorB =
        ordenacao.campo === "id"
          ? String(b.id ?? "")
          : (b[ordenacao.campo] ?? "").toString();

      return (
        valorA.localeCompare(valorB, "pt-BR", {
          sensitivity: "base",
        }) * direcao
      );
    });

    return copia;
  }, [produtos, ordenacao]);

  function handleOrdenar(campo: OrdenacaoCampo) {
    setOrdenacao((atual) => {
      if (!atual || atual.campo !== campo) {
        return { campo, direcao: "asc" };
      }

      return {
        campo,
        direcao: atual.direcao === "asc" ? "desc" : "asc",
      };
    });
  }

  function renderSeta(campo: OrdenacaoCampo) {
    if (!ordenacao || ordenacao.campo !== campo) {
      return "↕";
    }

    return ordenacao.direcao === "asc" ? "↑" : "↓";
  }

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-reset fw-semibold"
                onClick={() => handleOrdenar("id")}
              >
                ID {renderSeta("id")}
              </button>
            </th>
            <th>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-reset fw-semibold"
                onClick={() => handleOrdenar("nome")}
              >
                Nome {renderSeta("nome")}
              </button>
            </th>
            <th>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-reset fw-semibold"
                onClick={() => handleOrdenar("codigo")}
              >
                Código {renderSeta("codigo")}
              </button>
            </th>
            <th style={{ width: "180px" }}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtosOrdenados.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-body-secondary py-4">
                Nenhum produto base cadastrado.
              </td>
            </tr>
          ) : (
            produtosOrdenados.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>{produto.nome}</td>
                <td>{produto.codigo}</td>

                <td>
                  <div className="d-flex gap-2 text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEditar(produto)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        if (
                          window.confirm(`Deseja excluir "${produto.nome}"?`)
                        ) {
                          onExcluir(produto.id!);
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaProdutos;
