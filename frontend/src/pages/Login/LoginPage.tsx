import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/login", { username, password });
      const token = response.data?.token as string | undefined;

      if (!token) {
        setErro("Não foi possível iniciar a sessão.");
        return;
      }

      localStorage.setItem("mercflow_token", token);
      localStorage.setItem(
        "mercflow_usuario",
        JSON.stringify({
          username: response.data?.username ?? username,
          nome: response.data?.nome ?? username,
          loja_id: response.data?.loja_id,
          loja_nome: response.data?.loja_nome,
          perfil: response.data?.perfil,
          permissoes: response.data?.permissoes ?? [],
        }),
      );
      navigate("/", { replace: true });
    } catch (error) {
      setErro("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="card shadow-sm border-0"
        style={{ width: "100%", maxWidth: 420 }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 mb-1">MercFlow</h1>
            <p className="text-body-secondary mb-0">Acesso do administrador</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">
                Usuário
              </label>
              <input
                id="username"
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            {erro ? (
              <div className="alert alert-danger py-2">{erro}</div>
            ) : null}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
