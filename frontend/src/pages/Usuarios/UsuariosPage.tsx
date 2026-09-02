import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import usuarioService from "../../services/usuarioService";
import type { Usuario, UsuarioPayload } from "../../types/Usuario";

const permissoesPadrao = {
  operador: ["dashboard.read", "lancamento.create", "lancamento.read"],
  admin: [
    "dashboard.read",
    "dashboard.export",
    "lancamento.create",
    "lancamento.read",
    "produto.read",
    "produto.create",
    "produto.update",
    "departamento.read",
    "departamento.create",
    "usuario.read",
    "usuario.create",
    "usuario.update",
  ],
  visualizador: ["dashboard.read", "lancamento.read"],
};

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState<UsuarioPayload>({
    nome: "",
    username: "",
    senha: "",
    loja_id: 1,
    perfil: "operador",
    permissoes: [...permissoesPadrao.operador],
  });

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

  useEffect(() => {
    void carregarUsuarios();
  }, []);

  const opcoesPermissoes = useMemo(
    () => [
      "dashboard.read",
      "dashboard.export",
      "lancamento.create",
      "lancamento.read",
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

  function togglePermissao(permissao: string) {
    setForm((anterior) => {
      const existe = anterior.permissoes.includes(permissao);
      const proximo = existe
        ? anterior.permissoes.filter((item) => item !== permissao)
        : [...anterior.permissoes, permissao];

      return { ...anterior, permissoes: proximo };
    });
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
        loja_id: 1,
        perfil: "operador",
        permissoes: [...permissoesPadrao.operador],
      });
      await carregarUsuarios();
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
          <h1 className="h2 mb-1">Usuários</h1>
          <p className="text-body-secondary mb-0">
            Gerencie contas da loja e suas permissões.
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <form onSubmit={handleSubmit} className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Novo usuário</h2>

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
                <input
                  type="number"
                  className="form-control"
                  value={form.loja_id}
                  min={1}
                  onChange={(event) =>
                    setForm((anterior) => ({
                      ...anterior,
                      loja_id: Number(event.target.value || 1),
                    }))
                  }
                />
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
                </select>
              </div>

              <div className="mb-3">
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
                        <span className="small">{permissao}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {erro ? (
                <div className="alert alert-danger py-2">{erro}</div>
              ) : null}
              {sucesso ? (
                <div className="alert alert-success py-2">{sucesso}</div>
              ) : null}

              <button className="btn btn-primary w-100" type="submit">
                Criar usuário
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Usuários cadastrados</h2>

              {loading ? (
                <div className="text-body-secondary">Carregando...</div>
              ) : usuarios.length === 0 ? (
                <div className="alert alert-light border mb-0">
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
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id ?? usuario.username}>
                          <td>{usuario.nome}</td>
                          <td>{usuario.username}</td>
                          <td>{usuario.perfil}</td>
                          <td>{usuario.loja_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsuariosPage;
