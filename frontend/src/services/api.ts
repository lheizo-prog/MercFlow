import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mercflow_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const lojaSelecionada = localStorage.getItem("mercflow_loja_id");
  if (lojaSelecionada && config.headers) {
    config.headers["X-Loja-ID"] = lojaSelecionada;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) {
        const mensagem =
          (error.response?.data as { erro?: string })?.erro ??
          "Voce nao tem permissao para realizar esta acao.";
        window.dispatchEvent(
          new CustomEvent("auth-error", { detail: { mensagem } }),
        );
      } else if (status === 401) {
        localStorage.removeItem("mercflow_token");
        localStorage.removeItem("mercflow_usuario");
        const mensagem =
          (error.response?.data as { erro?: string })?.erro ??
          "Sessao expirada. Faca login novamente.";
        window.dispatchEvent(
          new CustomEvent("auth-error", { detail: { mensagem } }),
        );
      }
    }
    return Promise.reject(error);
  },
);

export default api;
