import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import lojaService from "../../../services/lojaService";
import { useAuth } from "../../../hooks/useAuth";
import type { Loja } from "../../../types/Loja";

type Props = { titulo: string; menuAberto: boolean; onAlternarMenu: () => void; };

function Navbar({ titulo, menuAberto, onAlternarMenu }: Props) {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const lojaAtual = Number(localStorage.getItem("mercflow_loja_id") || user?.loja_id || 0);
  const nomeLojaAtual = lojas.find((l) => l.id === lojaAtual)?.nome ?? user?.loja_nome ?? "Loja";

  useEffect(() => {
    if (!isAdmin) return;
    lojaService.listar().then(setLojas).catch(() => setLojas([]));
  }, [isAdmin]);

  function trocarLoja(id: number) {
    localStorage.setItem("mercflow_loja_id", String(id));
    window.location.reload();
  }

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
          {lojas.length > 0 && (
            <select className="form-select form-select-sm" value={lojaAtual || ""} onChange={(e) => trocarLoja(Number(e.target.value))}>
              {lojas.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          )}
          <span className="navbar-text text-white-50 small">{user?.username ?? user?.nome ?? "Usuario"} - {nomeLojaAtual}</span>
          <button type="button" className="btn btn-light btn-sm" onClick={() => { logout(); delete api.defaults.headers.common.Authorization; navigate("/login", { replace: true }); }}>Sair</button>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
