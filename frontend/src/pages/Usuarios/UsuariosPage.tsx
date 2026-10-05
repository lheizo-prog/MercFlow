import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import usuarioService from "../../services/usuarioService";
import lojaService from "../../services/lojaService";
import { useAuth } from "../../hooks/useAuth";
import { useRefetchOnFocus } from "../../hooks/useRefetchOnFocus";
import type { Usuario, UsuarioPayload, UsuarioUpdatePayload } from "../../types/Usuario";
import type { Loja } from "../../types/Loja";

const permissoesPadrao = {
  operador: [
    "dashboard.read",
    "lancamento.create",
    "lancamento.read",
    "lancamento.calculate",
    "produto.read",
    "departamento.read",
  ],
  admin: [
    "dashboard.read",
    "dashboard.export",
    "lancamento.create",
    "lancamento.read",
    "lancamento.calculate",
    "produto.read",
    "produto.create",
    "produto.update",
    "departamento.read",
    "departamento.create",
    "usuario.read",
    "usuario.create",
    "usuario.update",
  ],
  visualizador: [
    "dashboard.read",
    "lancamento.read",
    "lancamento.calculate",
    "produto.read",
    "departamento.read",
  ],
  super_admin: [
    "dashboard.read",
    "dashboard.compare",
    "loja.switch",
    "lancamento.create",
    "lancamento.read",
    "lancamento.calculate",
    "produto.read",
    "produto.create",
    "produto.update",
    "departamento.read",
    "departamento.create",
    "usuario.read",
    "usuario.create",
    "usuario.update",
  ],
};

// Mapeamento de permissoes tecnicas para nomes amigaveis
const permissoesLabels: Record<string, string> = {
  "dashboard.read": "Visualizar Dashboard",
  "dashboard.export": "Exportar Dados do Dashboard",
  "dashboard.compare": "Comparar Lojas no Dashboard",
  "loja.switch": "Alternar Lojas",
  "lancamento.create": "Criar Lançamentos",
  "lancamento.read": "Visualizar Lançamentos",
  "lancamento.calculate": "Calcular Conversão de Lançamentos",
  "produto.read": "Visualizar Produtos",
  "produto.create": "Criar Produtos",
  "produto.update": "Editar Produtos",
  "departamento.read": "Visualizar Departamentos",
  "departamento.create": "Criar Departamentos",
  "usuario.read": "Visualizar Usuários",
  "usuario.create": "Criar Usuários",
  "usuario.update": "Editar Usuários",
};

function UsuariosPage() {
  const { isSuperAdmin, user: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [lojas, setLojas] = useState<Loja[]>([]);

  // Estado para criação
  const [form, setForm] = useState<UsuarioPayload>({
    nome: "",
    username: "",
    senha: "",
    loja_id: 0,
    perfil: "operador",
    permissoes: [...permissoesPadrao.operador],
  });

  // Estado para edição (apenas super_admin)
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState<UsuarioUpdatePayload>({
    nome: "",
    username: "",
    senha: "",
    loja_id: 0,
    perfil: "operador",
    permissoes: [],
    ativo: true,
  });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  async function carregarUsuarios() {
    try {
      setLoading(true);
      const lista = await usuarioService.listar();
      setUsuarios(lista);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }

  const carregarLojas = useCallback(async () => {
    try {
      const lista = await lojaService.listar();
      setLojas(lista.filter((loja) => loja.ativo));
      setForm((anterior) => ({
        ...anterior,
        loja_id: anterior.loja_id || lista.find((loja) => loja.ativo)?.id || 0,
      }));
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar as lojas.");
    }
  }, []);

  useEffect(() => {
    void carregarUsuarios();
    void carregarLojas();
  }, [carregarLojas]);

  const recarregarEmSegundoPlano = useCallback(() => {
    void carregarUsuarios();
    void carregarLojas();
  }, [carregarLojas]);

  useRefetchOnFocus(recarregarEmSegundoPlano);

  const opcoesPermissoes = useMemo(
    () => [
      "dashboard.read",
      "dashboard.export",
      "dashboard.compare",
      "loja.switch",
      "lancamento.create",
      "lancamento.read",
      "lancamento.calculate",
      "produto.read",
      "produto.create",
      "produto.update",
      "departamento.read",
      "departamento.create",
      "usuario.read",
      "usuario.create",
      "usuario.update",
    ],
    [],
  );

  function handlePerfilChange(perfil: string) {
    setForm((anterior) => ({
      ...anterior,
      perfil,
      permissoes: [
        ...(permissoesPadrao[perfil as keyof typeof permissoesPadrao] ?? []),
      ],
    }));
  }

  function handleEditPerfilChange(perfil: string) {
    setEditForm((anterior) => ({
      ...anterior,
      perfil,
      permissoes: [
        ...(permissoesPadrao[perfil as keyof typeof permissoesPadrao] ?? []),
      ],
    }));
  }

  function togglePermissao(permissao: string) {
    setForm((anterior) => {
      const existe = anterior.permissoes.includes(permissao);
      const proximo = existe
        ? anterior.permissoes.filter((item) => item !== permissao)
        : [...anterior.permissoes, permissao];

      return { ...anterior, permissoes: proximo };
    });
  }

  function toggleEditPermissao(permissao: string) {
    setEditForm((anterior) => {
      const existe = anterior.permissoes.includes(permissao);
      const proximo = existe
        ? anterior.permissoes.filter((item) => item !== permissao)
        : [...anterior.permissoes, permissao];

      return { ...anterior, permissoes: proximo };
    });
  }

  function abrirEdicao(usuario: Usuario) {
    setErro("");
    setSucesso("");
    setEditandoUsuario(usuario);
    setEditForm({
      nome: usuario.nome,
      username: usuario.username,
      senha: "",
      loja_id: usuario.loja_id,
      perfil: usuario.perfil,
      permissoes: [...usuario.permissoes],
      ativo: usuario.ativo ?? true,
    });
  }

  function fecharEdicao() {
    setEditandoUsuario(null);
  }

  async function handleSalvarEdicao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editandoUsuario?.id) return;
    setErro("");
    setSucesso("");
    setSalvandoEdicao(true);

    try {
      await usuarioService.atualizar(editandoUsuario.id, editForm);
      setSucesso(`Usuário "${editForm.nome}" atualizado com sucesso.`);
      setEditandoUsuario(null);
      await carregarUsuarios();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const mensagem = error.response?.data?.erro;
        setErro(
          typeof mensagem === "string"
            ? mensagem
            : "Não foi possível atualizar o usuário.",
        );
      } else {
        setErro("Não foi possível atualizar o usuário.");
      }
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function handleExcluir(usuario: Usuario) {
    if (!usuario.id) return;
    if (usuarioLogado?.username === usuario.username) {
      alert("Você não pode excluir a sua própria conta.");
      return;
    }

    const confirmou = window.confirm(
      `Deseja realmente excluir o usuário "${usuario.nome}" (${usuario.username})? Esta ação não pode ser desfeita.`,
    );
    if (!confirmou) return;

    setErro("");
    setSucesso("");
    setExcluindoId(usuario.id);

    try {
      await usuarioService.excluir(usuario.id);
      setSucesso(`Usuário "${usuario.nome}" excluído com sucesso.`);
      await carregarUsuarios();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const mensagem = error.response?.data?.erro;
        setErro(
          typeof mensagem === "string"
            ? mensagem
            : "Não foi possível excluir o usuário.",
        );
      } else {
        setErro("Não foi possível excluir o usuário.");
      }
    } finally {
      setExcluindoId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    try {
      await usuarioService.criar(form);
      setSucesso("Usuário criado com sucesso.");
      setForm({
        nome: "",
        username: "",
        senha: "",
        loja_id: lojas.find((loja) => loja.ativo)?.id || 0,
        perfil: "operador",
        permissoes: [...permissoesPadrao.operador],
      });
      await Promise.all([carregarUsuarios(), carregarLojas()]);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const mensagem = error.response?.data?.erro;
        setErro(
          typeof mensagem === "string"
            ? mensagem
            : "Não foi possível criar o usuário.",
        );
      } else {
        setErro("Não foi possível criar o usuário.");
      }
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h1 className="h2 mb-1">Usuários</h1>
            {isSuperAdmin && (
              <span className="badge bg-warning text-dark fw-bold">
                Super Admin
              </span>
            )}
          </div>
          <p className="text-body-secondary mb-0">
            Gerencie contas do sistema e suas permissões de acesso.
          </p>
        </div>
      </div>

      {erro && (
        <div className="alert alert-danger py-2 d-flex align-items-center justify-content-between mb-4">
          <span>{erro}</span>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setErro("")}
          />
        </div>
      )}
      {sucesso && (
        <div className="alert alert-success py-2 d-flex align-items-center justify-content-between mb-4">
          <span>{sucesso}</span>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setSucesso("")}
          />
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-5">
          <form onSubmit={handleSubmit} className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3 fw-bold text-dark">Novo usuário</h2>

              <div className="mb-3">
                <label className="form-label fw-semibold">Nome</label>
                <input
                  className="form-control"
                  required
                  value={form.nome}
                  onChange={(event) =>
                    setForm((anterior) => ({
                      ...anterior,
                      nome: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Usuário</label>
                <input
                  className="form-control"
                  required
                  value={form.username}
                  onChange={(event) =>
                    setForm((anterior) => ({
                      ...anterior,
                      username: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Senha</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  minLength={6}
                  value={form.senha}
                  onChange={(event) =>
                    setForm((anterior) => ({
                      ...anterior,
                      senha: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Loja</label>
                <select
                  className="form-select"
                  value={form.loja_id}
                  required
                  onChange={(event) =>
                    setForm((anterior) => ({
                      ...anterior,
                      loja_id: Number(event.target.value),
                    }))
                  }
                >
                  <option value={0} disabled>
                    Selecione uma loja
                  </option>
                  {lojas.map((loja) => (
                    <option key={loja.id} value={loja.id}>
                      {loja.nome} ({loja.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Perfil</label>
                <select
                  className="form-select"
                  value={form.perfil}
                  onChange={(event) => handlePerfilChange(event.target.value)}
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                  <option value="visualizador">Visualizador</option>
                  {isSuperAdmin && (
                    <option value="super_admin">Super Administrador</option>
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Permissões</label>
                <div className="row g-2">
                  {opcoesPermissoes.map((permissao) => (
                    <div key={permissao} className="col-12 col-md-6">
                      <label className="form-check-label d-flex align-items-center gap-2 border rounded p-2 w-100">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={form.permissoes.includes(permissao)}
                          onChange={() => togglePermissao(permissao)}
                        />
                        <span className="small">
                          {permissoesLabels[permissao] ?? permissao}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary w-100 fw-semibold" type="submit">
                Criar usuário
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 mb-0 fw-bold text-dark">Usuários cadastrados</h2>
                <span className="badge bg-light text-secondary border">
                  Total: {usuarios.length}
                </span>
              </div>

              {loading ? (
                <div className="text-body-secondary py-4 text-center">Carregando...</div>
              ) : usuarios.length === 0 ? (
                <div className="alert alert-light border mb-0 text-center py-4">
                  Nenhum usuário cadastrado.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Usuário</th>
                        <th>Perfil</th>
                        <th>Loja</th>
                        {isSuperAdmin && <th className="text-end">Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => {
                        const ehProprio = usuarioLogado?.username === u.username;
                        return (
                          <tr key={u.id ?? u.username}>
                            <td>
                              <div className="fw-semibold text-dark">{u.nome}</div>
                              {u.ativo === false && (
                                <span className="badge bg-danger-subtle text-danger" style={{ fontSize: "0.65rem" }}>
                                  Inativo
                                </span>
                              )}
                            </td>
                            <td>
                              <code className="text-secondary">{u.username}</code>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  u.perfil === "super_admin"
                                    ? "bg-warning text-dark"
                                    : u.perfil === "admin"
                                    ? "bg-primary text-white"
                                    : "bg-light text-secondary border"
                                }`}
                              >
                                {u.perfil}
                              </span>
                            </td>
                            <td>
                              {lojas.find((l) => l.id === u.loja_id)?.nome ??
                                "Loja " + u.loja_id}
                            </td>
                            {isSuperAdmin && (
                              <td className="text-end">
                                <div className="d-flex align-items-center justify-content-end gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary py-1 px-2"
                                    onClick={() => abrirEdicao(u)}
                                    title="Editar usuário"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <span className="d-none d-sm-inline ms-1">Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger py-1 px-2"
                                    disabled={ehProprio || excluindoId === u.id}
                                    onClick={() => handleExcluir(u)}
                                    title={ehProprio ? "Não é permitido excluir a própria conta" : "Excluir usuário"}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="d-none d-sm-inline ms-1">
                                      {excluindoId === u.id ? "Excluindo..." : "Excluir"}
                                    </span>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição (Somente Super Admin) */}
      {isSuperAdmin && editandoUsuario && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Usuário: {editandoUsuario.nome}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharEdicao}
                  disabled={salvandoEdicao}
                />
              </div>

              <form onSubmit={handleSalvarEdicao}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Nome</label>
                      <input
                        className="form-control"
                        required
                        value={editForm.nome}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, nome: e.target.value }))
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Usuário (login)</label>
                      <input
                        className="form-control"
                        required
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Nova Senha <small className="text-muted fw-normal">(opcional)</small>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Deixe em branco para manter a atual"
                        minLength={6}
                        value={editForm.senha ?? ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, senha: e.target.value }))
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Loja</label>
                      <select
                        className="form-select"
                        value={editForm.loja_id}
                        required
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            loja_id: Number(e.target.value),
                          }))
                        }
                      >
                        {lojas.map((loja) => (
                          <option key={loja.id} value={loja.id}>
                            {loja.nome} ({loja.codigo})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Perfil</label>
                      <select
                        className="form-select"
                        value={editForm.perfil}
                        onChange={(e) => handleEditPerfilChange(e.target.value)}
                      >
                        <option value="operador">Operador</option>
                        <option value="admin">Administrador</option>
                        <option value="visualizador">Visualizador</option>
                        <option value="super_admin">Super Administrador</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6 d-flex align-items-center pt-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="editAtivo"
                          checked={editForm.ativo ?? true}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              ativo: e.target.checked,
                            }))
                          }
                        />
                        <label className="form-check-label fw-semibold ms-2" htmlFor="editAtivo">
                          Usuário Ativo
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Permissões de Acesso</label>
                      <div className="row g-2 border rounded p-3 bg-light">
                        {opcoesPermissoes.map((permissao) => (
                          <div key={permissao} className="col-12 col-md-6">
                            <label className="form-check-label d-flex align-items-center gap-2 p-1 w-100">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={editForm.permissoes.includes(permissao)}
                                onChange={() => toggleEditPermissao(permissao)}
                              />
                              <span className="small">
                                {permissoesLabels[permissao] ?? permissao}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={fecharEdicao}
                    disabled={salvandoEdicao}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold"
                    disabled={salvandoEdicao}
                  >
                    {salvandoEdicao ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosPage;
