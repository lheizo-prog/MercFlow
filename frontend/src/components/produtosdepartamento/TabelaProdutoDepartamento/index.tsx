import { useMemo, useState } from "react";

import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

interface TabelaProdutosDepartamentoProps {
  produtos: ProdutoDepartamento[];
  onEditar: (produto: ProdutoDepartamento) => void;
  onExcluir: (id: number) => void;
}

type OrdenacaoDirecao = "asc" | "desc";
type OrdenacaoCampo =
  | "id"
  | "produto_generico_nome"
  | "departamento_nome"
  | "nome"
  | "codigo"
  | "unidade_medida";

function TabelaProdutosDepartamento({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosDepartamentoProps) {
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
      const valorA = (a[ordenacao.campo] ?? "").toString();
      const valorB = (b[ordenacao.campo] ?? "").toString();

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

  if (produtos.length === 0) {
    return (
      <div className="alert alert-light border text-body-secondary">
        Nenhum produto de departamento encontrado.
      </div>
    );
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
                onClick={() => handleOrdenar("produto_generico_nome")}
              >
                Produto Base {renderSeta("produto_generico_nome")}
              </button>
            </th>
            <th>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-reset fw-semibold"
                onClick={() => handleOrdenar("departamento_nome")}
              >
                Departamento {renderSeta("departamento_nome")}
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
            <th>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-reset fw-semibold"
                onClick={() => handleOrdenar("unidade_medida")}
              >
                Unidade {renderSeta("unidade_medida")}
              </button>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtosOrdenados.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.produto_generico_nome}</td>
              <td>{produto.departamento_nome}</td>
              <td>{produto.nome}</td>
              <td>{produto.codigo}</td>
              <td>{String(produto.unidade_medida)}</td>
              <td>
                <div className="d-flex gap-2 text-nowrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onEditar(produto)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onExcluir(produto.id!)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaProdutosDepartamento;
