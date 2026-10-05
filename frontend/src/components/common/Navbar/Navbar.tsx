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
    <nav className="navbar navbar-dark sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        {/* Lado Esquerdo: Botão Menu Mobile e Logo/Título */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-light d-lg-none d-flex align-items-center justify-content-center p-1"
            style={{ width: "36px", height: "36px", borderColor: "rgba(255,255,255,0.25)" }}
            aria-label="Alternar Menu"
            aria-expanded={menuAberto}
            onClick={onAlternarMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-white text-primary shadow-sm fw-bold px-2 py-1" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>
              MF
            </span>
            <span className="navbar-brand mb-0 h1 fw-bold fs-5 text-white" style={{ letterSpacing: "-0.02em" }}>
              {titulo}
            </span>
          </div>
        </div>

        {/* Lado Direito: Seletor de Loja, Usuário e Botão Sair */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {podeTrocarLoja && lojas.length > 0 ? (
            <div className="d-flex align-items-center position-relative">
              <span className="position-absolute start-0 ms-2 text-primary d-none d-sm-inline-flex" style={{ pointerEvents: "none", zIndex: 5 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.455-.914L12.378 2H3.622l-2.69 3.136a1.375 1.375 0 0 0 2.455.914.5.5 0 0 1 1.363-.425z"/>
                </svg>
              </span>
              <select
                id="loja-selector"
                className="form-select form-select-sm bg-white text-dark fw-semibold border-0 shadow-sm ps-sm-4 pe-4 py-1"
                style={{
                  maxWidth: "180px",
                  fontSize: "0.85rem",
                  borderRadius: "9999px",
                  cursor: "pointer"
                }}
                value={lojaSelecionada}
                onChange={(e) => handleTrocarLoja(Number(e.target.value))}
                title="Selecione a loja de trabalho"
              >
                {lojas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1 text-white bg-white bg-opacity-10 px-2 py-1 rounded-pill small">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.455-.914L12.378 2H3.622l-2.69 3.136a1.375 1.375 0 0 0 2.455.914.5.5 0 0 1 1.363-.425z"/>
              </svg>
              <span className="fw-medium">{nomeLojaAtual}</span>
            </div>
          )}

          {/* Nome do Usuário */}
          <div className="d-none d-md-flex align-items-center gap-1 text-white-50 small">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            </svg>
            <span className="text-white fw-medium">{user?.username ?? user?.nome ?? "Usuário"}</span>
          </div>

          {/* Botão Sair */}
          <button
            type="button"
            className="btn btn-sm btn-light d-flex align-items-center gap-1 shadow-sm px-2 px-sm-3"
            style={{ borderRadius: "9999px", fontSize: "0.825rem" }}
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
