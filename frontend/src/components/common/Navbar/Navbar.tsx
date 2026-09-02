import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import lojaService from "../../../services/lojaService";
import type { Loja } from "../../../types/Loja";

type NavbarProps = {
  titulo: string;
  menuAberto: boolean;
  onAlternarMenu: () => void;
};

function Navbar({ titulo, menuAberto, onAlternarMenu }: NavbarProps) {
  const navigate = useNavigate();
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("mercflow_usuario") ?? "null") as {
        username?: string;
        nome?: string;
        loja_id?: number;
        loja_nome?: string;
        perfil?: string;
      } | null;
    } catch {
      return null;
    }
  })();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const lojaAtual = Number(
    localStorage.getItem("mercflow_loja_id") || usuario?.loja_id || 0,
  );
  const nomeLojaAtual =
    lojas.find((loja) => loja.id === lojaAtual)?.nome ??
    usuario?.loja_nome ??
    "Loja não identificada";

  useEffect(() => {
    if (usuario?.perfil !== "admin" && usuario?.perfil !== "super_admin") {
      return;
    }
    void lojaService
      .listar()
      .then(setLojas)
      .catch(() => setLojas([]));
  }, [usuario?.perfil]);

  function trocarLoja(lojaID: number) {
    localStorage.setItem("mercflow_loja_id", String(lojaID));
    window.location.reload();
  }

  function logout() {
    localStorage.removeItem("mercflow_token");
    localStorage.removeItem("mercflow_usuario");
    localStorage.removeItem("mercflow_loja_id");
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
          {lojas.length > 0 ? (
            <select
              className="form-select form-select-sm"
              value={lojaAtual || ""}
              aria-label="Loja selecionada"
              onChange={(event) => trocarLoja(Number(event.target.value))}
            >
              {lojas.map((loja) => (
                <option key={loja.id} value={loja.id}>
                  {loja.nome}
                </option>
              ))}
            </select>
          ) : null}
          <span className="navbar-text text-white-50 small">
            {usuario?.username ?? usuario?.nome ?? "Usuário"} · {nomeLojaAtual}
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
