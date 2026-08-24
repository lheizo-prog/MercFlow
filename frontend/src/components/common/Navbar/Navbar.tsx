type NavbarProps = {
  titulo: string;
  menuAberto: boolean;
  onAlternarMenu: () => void;
};

function Navbar({ titulo, menuAberto, onAlternarMenu }: NavbarProps) {
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
        <span className="navbar-text text-white-50 small">
          Gestão de estoque
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
