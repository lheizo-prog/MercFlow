import { useMemo } from "react";
import type { ProdutoGenerico } from "../../../types/ProdutoGenerico";

interface TabelaProdutosProps {
  produtos: ProdutoGenerico[];
  onEditar: (produto: ProdutoGenerico) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutos({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosProps) {
  const produtosOrdenados = useMemo(() => [...produtos], [produtos]);

  if (produtosOrdenados.length === 0) {
    return (
      <div className="table-responsive bg-white rounded shadow-sm">
        <div className="text-center text-body-secondary py-4">
          Nenhum produto base cadastrado.
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <div className="row g-3">
        {produtosOrdenados.map((produto) => (
          <div key={produto.id} className="col-12 col-sm-6 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h6 className="card-subtitle mb-2 text-body-secondary">
                  ID: {produto.id}
                </h6>
                <h5 className="card-title mb-1">{produto.nome}</h5>
                <p className="card-subtitle mb-3 text-muted">
                  Código: {produto.codigo}
                </p>
                <div className="mt-auto">
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => onEditar(produto)}
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir "${produto.nome}"?`)) {
                          onExcluir(produto.id!);
                        }
                      }}
                      className="btn btn-sm btn-outline-danger flex-grow-1"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TabelaProdutos;
