import type { Lancamento, LancamentoPayload } from "../types/Lancamento";
import api from "./api";

interface ConversaoResponse {
  unidade_mercearia: string;
  unidade_departamento: string;
  fator_conversao: number;
  total_lancado: number;
}

const LancamentoService = {
  async buscarTodos() {
    const response = await api.get<Lancamento[]>("/lancamentos");

    return response.data;
  },

  async criar(lancamento: LancamentoPayload): Promise<Lancamento> {
    const response = await api.post("/lancamentos", {
      tipo: lancamento.tipo,
      departamento_id: lancamento.departamentoID,
      observacao: lancamento.observacao,
      itens: lancamento.itens.map((item) => ({
        ...(item.produtoMerceariaID > 0
          ? { produto_mercearia_id: item.produtoMerceariaID }
          : {}),
        ...(item.produtoDepartamentoID > 0
          ? { produto_departamento_id: item.produtoDepartamentoID }
          : {}),
        quantidade: item.quantidade,
      })),
    });
    console.log("Lancamento criado:", response.data);
    return response.data;
  },

  async buscarConversao(
    produtoMerceariaID: number,
    produtoDepartamentoID: number,
  ): Promise<ConversaoResponse> {
    const response = await api.get<ConversaoResponse>(
      "/lancamentos/conversao",
      {
        params: {
          produto_m_id: produtoMerceariaID,
          produto_d_id: produtoDepartamentoID,
        },
      },
    );

    return response.data;
  },

  async scanEtiquetas(
    imageFile: File,
    departamentoId?: number,
  ): Promise<import("../types/ScanEtiquetas").ScanEtiquetasResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (departamentoId && departamentoId > 0) {
      formData.append("departamento_id", String(departamentoId));
    }

    const response = await api.post<import("../types/ScanEtiquetas").ScanEtiquetasResponse>(
      "/lancamentos/scan-etiquetas",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};

export default LancamentoService;
