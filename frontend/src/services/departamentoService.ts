import type { Departamento } from "../types/Departamento";
import api from "./api";

const departamentoService = {
  async buscarTodos() {
    const response = await api.get<Departamento[]>("/departamentos");
    return response.data;
  },

  async criar(departamento: Departamento): Promise<Departamento> {
    const response = await api.post("/departamentos", departamento);

    return response.data;
  },

  async atualizar(departamento: Departamento): Promise<Departamento> {
    const response = await api.put<Departamento>(
      `/departamentos/id/${departamento.id}`,
      departamento,
    );

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    return api.delete(`departamentos/id/${id}`);
  },
};

export default departamentoService;
