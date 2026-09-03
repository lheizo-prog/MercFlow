import { useAuthError } from "../../../contexts/AuthErrorContext";

function ErroAutorizacaoModal() {
  const { erro, fechar } = useAuthError();

  if (!erro) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show" onClick={fechar}></div>
      <div className="modal d-block" tabIndex={-1}>
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-danger">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Acesso Negado</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={fechar}
              ></button>
            </div>
            <div className="modal-body text-center py-4">
              <div className="mb-3" style={{ fontSize: "3rem" }}>
                <span aria-hidden="true">&#128683;</span>
              </div>
              <p className="mb-0 fs-5">{erro}</p>
            </div>
            <div className="modal-footer justify-content-center border-top-0">
              <button type="button" className="btn btn-danger" onClick={fechar}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ErroAutorizacaoModal;
