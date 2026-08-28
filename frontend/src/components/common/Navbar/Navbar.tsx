import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

type NavbarProps = {
  titulo: string;
  menuAberto: boolean;
  onAlternarMenu: () => void;
};

function Navbar({ titulo, menuAberto, onAlternarMenu }: NavbarProps) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("mercflow_token");
    delete api.defaults.headers.common.Authorization;
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-light d-lg-none"
            aria-label={menuAberto ? "Recolher menu" : "Expandir menu"}
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            onClick={onAlternarMenu}
          >
            <span aria-hidden="true">&#9776;</span>
            <span className="visually-hidden">
              {menuAberto ? "Recolher menu" : "Expandir menu"}
            </span>
          </button>
          <span className="navbar-brand mb-0 h1 fw-semibold">{titulo}</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="navbar-text text-white-50 small">
            Lançamentos de estoque
          </span>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={logout}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
