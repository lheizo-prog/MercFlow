import type { ProdutoGenerico } from "../../../types/ProdutoGenerico";
import type { ProdutoMercearia } from "../../../types/ProdutoMercearia";

import ProdutoMerceariaForm from "../ProdutoMerceariaForm";

interface ProdutoMerceariaModalProps {
  aberto: boolean;
  produto?: ProdutoMercearia;
  produtosGenericos: ProdutoGenerico[];
  onFechar: () => void;
  onSalvar: (produto: ProdutoMercearia) => Promise<void>;
}

function ProdutoMerceariaModal({
  aberto,
  produto,
  produtosGenericos,
  onFechar,
  onSalvar,
}: ProdutoMerceariaModalProps) {
  if (!aberto) {
    return null;
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      {" "}
      <div className="modal-dialog modal-lg modal-dialog-centered">
        {" "}
        <div className="modal-content">
          {" "}
          <div className="modal-header">
            {" "}
            <h5 className="modal-title">
              {produto
                ? "Editar Produto da Mercearia"
                : "Novo Produto da Mercearia"}{" "}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Fechar"
              onClick={onFechar}
            />
          </div>
          <div className="modal-body">
            <ProdutoMerceariaForm
              produto={produto}
              produtosGenericos={produtosGenericos}
              onSalvar={onSalvar}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProdutoMerceariaModal;
