import DOMPurify from "dompurify";
import { useAuthError } from "../../../hooks/useAuthError";

function ErroAutorizacaoModal() {
  const { erro, fechar } = useAuthError();

  if (!erro) return null;

  // Sanitização defensiva (embora já sanitizado no provider)
  const safeErro = DOMPurify.sanitize(erro);

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={fechar}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title text-danger">Erro de Autorização</h5>
            <button type="button" className="btn-close" onClick={fechar}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{safeErro}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={fechar}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErroAutorizacaoModal;
