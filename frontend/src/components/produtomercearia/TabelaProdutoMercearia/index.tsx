import { useMemo } from "react";
import type { ProdutoMercearia } from "../../../types/ProdutoMercearia";

interface TabelaProdutoMerceariaProps {
  produtos: ProdutoMercearia[];
  onEditar: (produto: ProdutoMercearia) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutoMercearia({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutoMerceariaProps) {
  const produtosOrdenados = useMemo(() => [...produtos], [produtos]);

  if (produtosOrdenados.length === 0) {
    return (
      <div className="table-responsive bg-white rounded shadow-sm">
        <div className="text-center text-body-secondary py-4">
          Nenhum produto da mercearia encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <div className="row g-3">
        {produtosOrdenados.map((produto) => (
          <div key={produto.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h6 className="card-subtitle mb-2 text-body-secondary">
                  Produto: {produto.produto_generico_nome}
                </h6>
                <h5 className="card-title mb-1">
                  <strong>{produto.sku}</strong>
                </h5>
                <p className="card-text small mb-1">
                  Marca: {produto.marca}
                </p>
                <p className="card-text small mb-1">
                  {produto.descricao}
                </p>
                <p className="card-text small mb-1">
                  Código Barras: {produto.codigo_barras}
                </p>
                <p className="card-text small mb-3 text-muted">
                  Embalagem: {produto.quantidade_embalagem} {produto.unidade_medida}
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
                        if (produto.id !== undefined) {
                          onExcluir(produto.id);
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

export default TabelaProdutoMercearia;
