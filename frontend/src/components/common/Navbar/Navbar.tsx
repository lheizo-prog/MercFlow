import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import lojaService from "../../../services/lojaService";
import type { Loja } from "../../../types/Loja";

type Props = { titulo: string; menuAberto: boolean; onAlternarMenu: () => void; };

function Navbar({ titulo, menuAberto, onAlternarMenu }: Props) {
  const navigate = useNavigate();
  const { user, isAdmin, hasPermission, logout } = useAuth();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState<number>(() => {
    const salva = localStorage.getItem("mercflow_loja_id");
    return salva ? Number(salva) : (user?.loja_id ?? 0);
  });

  const podeTrocarLoja = isAdmin || hasPermission("loja.switch");

  useEffect(() => {
    if (podeTrocarLoja) {
      lojaService
        .listar()
        .then((lista) => {
          setLojas(lista);
          // Se não houver loja selecionada no localStorage, usa a do usuário ou a primeira da lista
          const salva = localStorage.getItem("mercflow_loja_id");
          if (!salva && user?.loja_id) {
            localStorage.setItem("mercflow_loja_id", String(user.loja_id));
            setLojaSelecionada(user.loja_id);
          }
        })
        .catch(() => {});
    }
  }, [podeTrocarLoja, user?.loja_id]);

  const handleTrocarLoja = (novaLojaId: number) => {
    setLojaSelecionada(novaLojaId);
    localStorage.setItem("mercflow_loja_id", String(novaLojaId));
    // Atualizar nome da loja no mercflow_usuario para consistencia visual
    const lojaObj = lojas.find((l) => l.id === novaLojaId);
    if (lojaObj && user) {
      const usuarioAtualizado = {
        ...user,
        loja_id: novaLojaId,
        loja_nome: lojaObj.nome,
      };
      localStorage.setItem("mercflow_usuario", JSON.stringify(usuarioAtualizado));
    }
    // Dispara reload ou evento de armazenamento para recarregar componentes
    window.location.reload();
  };

  const nomeLojaAtual =
    lojas.find((l) => l.id === lojaSelecionada)?.nome ??
    user?.loja_nome ??
    "Loja";

  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-light d-lg-none"
            aria-label="Menu"
            aria-expanded={menuAberto}
            onClick={onAlternarMenu}
          >
            <span aria-hidden="true">&#9776;</span>
          </button>
          <span className="navbar-brand mb-0 h1 fw-semibold">{titulo}</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          {podeTrocarLoja && lojas.length > 0 ? (
            <div className="d-flex align-items-center gap-2">
              <label
                htmlFor="loja-selector"
                className="text-white-50 small mb-0 d-none d-sm-inline"
              >
                Loja:
              </label>
              <select
                id="loja-selector"
                className="form-select form-select-sm bg-white text-dark border-0 shadow-sm"
                style={{ maxWidth: "200px", fontWeight: 500 }}
                value={lojaSelecionada}
                onChange={(e) => handleTrocarLoja(Number(e.target.value))}
              >
                {lojas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="navbar-text text-white-50 small">
              {nomeLojaAtual}
            </span>
          )}

          <span className="navbar-text text-white-50 small d-none d-md-inline">
            | {user?.username ?? user?.nome ?? "Usuario"}
          </span>

          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
