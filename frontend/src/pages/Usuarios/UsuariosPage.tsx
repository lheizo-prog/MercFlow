import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import usuarioService from "../../services/usuarioService";
import lojaService from "../../services/lojaService";
import type { Usuario, UsuarioPayload } from "../../types/Usuario";
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
};
// Mapeamento de permissoes tecnicas para nomes amigaveis
const permissoesLabels: Record<string, string> = {
  "dashboard.read": "Visualizar Dashboard",
  "dashboard.export": "Exportar Dados do Dashboard",
  "lancamento.create": "Criar Lancamentos",
  "lancamento.read": "Visualizar Lancamentos",
  "lancamento.calculate": "Calcular Conversao de Lançamentos",
  "produto.read": "Visualizar Produtos",
  "produto.create": "Criar Produtos",
  "produto.update": "Editar Produtos",
  "departamento.read": "Visualizar Departamentos",
  "departamento.create": "Criar Departamentos",
  "usuario.read": "Visualizar Usuarios",
  "usuario.create": "Criar Usuarios",
  "usuario.update": "Editar Usuarios",
};


function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [lojas, setLojas] = useState<Loja[]>([]);

  const [form, setForm] = useState<UsuarioPayload>({
    nome: "",
    username: "",
    senha: "",
    loja_id: 0,
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
    void lojaService
      .listar()
      .then((lista) => {
        setLojas(lista.filter((loja) => loja.ativo));
        setForm((anterior) => ({
          ...anterior,
          loja_id:
            anterior.loja_id || lista.find((loja) => loja.ativo)?.id || 0,
        }));
      })
      .catch((error) => {
        console.error(error);
        setErro("Não foi possível carregar as lojas.");
      });
  }, []);

  const opcoesPermissoes = useMemo(
    () => [
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
        loja_id: lojas.find((loja) => loja.ativo)?.id || 0,
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
                        <span className="small">{permissoesLabels[permissao] ?? permissao}</span>
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
                          <td>{lojas.find((l) => l.id === usuario.loja_id)?.nome ?? ("Loja " + usuario.loja_id)}</td>
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
