import type { Produto } from "../../types/Produto";
import ProdutoForm from "../ProdutoForm/ProdutoForm";

interface ProdutoModalProps {
  aberto: boolean;
  produto?: Produto;
  onFechar: () => void;
  onSalvar: (produto: Produto) => Promise<void>;
}

function ProdutoModal({
  aberto,
  produto,
  onFechar,
  onSalvar,
}: ProdutoModalProps) {
  if (!aberto) {
    return null;
  }
  async function salvarProduto(produto: Produto) {
    await onSalvar(produto);
    onFechar();
  }
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onFechar}></div>
      <div className="modal d-block" tabIndex={-1}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {produto ? "Editar Produto" : "Novo Produto"}
              </h5>
              <button type="button" className="btn-close" onClick={onFechar} />
            </div>
            <div className="modal-body">
              <ProdutoForm produto={produto} onSalvar={salvarProduto} />
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

export default ProdutoModal;
