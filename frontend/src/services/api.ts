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

export default api;
