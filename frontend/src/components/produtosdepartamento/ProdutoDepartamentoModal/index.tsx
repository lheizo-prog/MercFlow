import type { Produto } from "../../../types/Produto";
import type { Departamento } from "../../../types/Departamento";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

import ProdutoDepartamentoForm from "../ProdutoDepartamentoForm";

interface ProdutoDepartamentoModalProps {
  aberto: boolean;

  produto?: ProdutoDepartamento;

  produtosBase: Produto[];

  departamentos: Departamento[];

  onFechar: () => void;

  onSalvar: (produto: ProdutoDepartamento) => Promise<void>;
}

function ProdutoDepartamentoModal({
  aberto,
  produto,
  produtosBase,
  departamentos,
  onFechar,
  onSalvar,
}: ProdutoDepartamentoModalProps) {
  if (!aberto) {
    return null;
  }

  async function salvarProdutoDepartamento(
    produtoDepartamento: ProdutoDepartamento,
  ) {
    await onSalvar(produtoDepartamento);
    onFechar();
  }

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onFechar}></div>

      <div className="modal d-block" tabIndex={-1}>
        <div
          className="modal-dialog modal-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {produto
                  ? "Editar Produto do Departamento"
                  : "Novo Produto do Departamento"}
              </h5>

              <button type="button" className="btn-close" onClick={onFechar} />
            </div>

            <div className="modal-body">
              <ProdutoDepartamentoForm
                produto={produto}
                produtosBase={produtosBase}
                departamentos={departamentos}
                onSalvar={salvarProdutoDepartamento}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onFechar}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProdutoDepartamentoModal;
