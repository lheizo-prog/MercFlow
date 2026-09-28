import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

type Props = { titulo: string; menuAberto: boolean; onAlternarMenu: () => void; };

function Navbar({ titulo, menuAberto, onAlternarMenu }: Props) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const nomeLojaAtual = user?.loja_nome ?? "Loja";

  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-light d-lg-none" aria-label="Menu" aria-expanded={menuAberto} onClick={onAlternarMenu}>
            <span aria-hidden="true">&#9776;</span>
          </button>
          <span className="navbar-brand mb-0 h1 fw-semibold">{titulo}</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="navbar-text text-white-50 small">{user?.username ?? user?.nome ?? "Usuario"} - {nomeLojaAtual}</span>
          <button type="button" className="btn btn-light btn-sm" onClick={() => { logout(); navigate("/login", { replace: true }); }}>Sair</button>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
