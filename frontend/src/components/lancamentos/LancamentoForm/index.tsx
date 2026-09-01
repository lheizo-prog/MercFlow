import {
  useEffect,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";

import type {
  Lancamento,
  LancamentoItem,
  LancamentoPayload,
} from "../../../types/Lancamento";
import type { Departamento } from "../../../types/Departamento";
import type { ProdutoMercearia } from "../../../types/ProdutoMercearia";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

import LancamentoService from "../../../services/lancamentoService";

interface LancamentoFormProps {
  lancamento?: Lancamento;

  departamentos: Departamento[];
  produtosMercearia: ProdutoMercearia[];
  produtosDepartamento: ProdutoDepartamento[];

  onSalvar: (lancamento: LancamentoPayload) => Promise<void>;
}

function LancamentoForm({
  lancamento,
  departamentos,
  produtosMercearia,
  produtosDepartamento,
  onSalvar,
}: LancamentoFormProps) {
  const [form, setForm] = useState<Lancamento>({
    departamentoID: 0,
    tipo: "",
    data: new Date(),
    itens: [],
  });

  const [itemAtual, setItemAtual] = useState<LancamentoItem>({
    produtoMerceariaID: 0,
    produtoDepartamentoID: 0,
    quantidade: 0,
    unidadeMercearia: "",
    unidadeDepartamento: "",
    fatorConversao: 0,
    totalLancado: 0,
  });

  const [carregandoConversao, setCarregandoConversao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro">(
    "sucesso",
  );
  const [produtoMerceariaBusca, setProdutoMerceariaBusca] = useState("");
  const [mostrarSugestoesMercearia, setMostrarSugestoesMercearia] =
    useState(false);
  const [produtoDepartamentoBusca, setProdutoDepartamentoBusca] = useState("");
  const [mostrarSugestoesDepartamento, setMostrarSugestoesDepartamento] =
    useState(false);

  const isQuebra = form.tipo === "QUEBRA";
  const departamentosSemDuplicatas = departamentos.filter(
    (departamento, index, lista) =>
      lista.findIndex(
        (item) =>
          item.nome.trim().toLowerCase() ===
          departamento.nome.trim().toLowerCase(),
      ) === index,
  );
  const departamentoMercearia = departamentosSemDuplicatas.find(
    (departamento) => departamento.nome.trim().toLowerCase() === "mercearia",
  );
  const isDepartamentoMercearia =
    isQuebra && form.departamentoID === departamentoMercearia?.id;
  const departamentosDisponiveis = isQuebra
    ? departamentosSemDuplicatas
    : departamentosSemDuplicatas.filter(
        (departamento) =>
          departamento.nome.trim().toLowerCase() !== "mercearia",
      );

  const isProdutoDepartamento = (
    produto: ProdutoDepartamento | ProdutoMercearia,
  ): produto is ProdutoDepartamento =>
    "departamento_id" in produto && "nome" in produto && "codigo" in produto;

  useEffect(() => {
    if (lancamento) {
      setForm(lancamento);
    } else {
      setForm({
        departamentoID: 0,
        tipo: "",
        data: new Date(),
        itens: [],
      });
    }

    setItemAtual({
      produtoMerceariaID: 0,
      produtoDepartamentoID: 0,
      quantidade: 0,
      unidadeMercearia: "",
      unidadeDepartamento: "",
      fatorConversao: 0,
      totalLancado: 0,
    });
  }, [lancamento]);

  useEffect(() => {
    async function carregarConversao() {
      const produtoM = itemAtual.produtoMerceariaID;
      const produtoD = itemAtual.produtoDepartamentoID;

      if (produtoM <= 0 || produtoD <= 0) {
        setItemAtual((anterior) => ({
          ...anterior,
          unidadeMercearia: "",
          unidadeDepartamento: "",
          fatorConversao: 0,
        }));

        return;
      }

      setCarregandoConversao(true);

      try {
        const conversao = await LancamentoService.buscarConversao(
          produtoM,
          produtoD,
        );

        setItemAtual((anterior) => ({
          ...anterior,
          unidadeMercearia: conversao.unidade_mercearia,
          unidadeDepartamento: conversao.unidade_departamento,
          fatorConversao: conversao.fator_conversao,
        }));
      } catch (error) {
        console.error("Erro ao buscar fator de conversão:", error);

        setItemAtual((anterior) => ({
          ...anterior,
          unidadeMercearia: "",
          unidadeDepartamento: "",
          fatorConversao: 0,
        }));
      } finally {
        setCarregandoConversao(false);
      }
    }

    carregarConversao();
  }, [itemAtual.produtoMerceariaID, itemAtual.produtoDepartamentoID]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const novoTipo = name === "tipo" ? value : form.tipo;
    const novoDepartamentoID =
      name === "departamentoID" ? Number(value) : form.departamentoID;
    const deveLimparMercearia =
      novoTipo !== "QUEBRA" && novoDepartamentoID === departamentoMercearia?.id;

    setForm((anterior) => ({
      ...anterior,
      [name]: name === "departamentoID" ? Number(value) : value,
      ...(deveLimparMercearia ? { departamentoID: 0 } : {}),
      ...(name === "tipo" || name === "departamentoID" ? { itens: [] } : {}),
    }));

    if (name === "tipo" || name === "departamentoID") {
      setItemAtual({
        produtoMerceariaID: 0,
        produtoDepartamentoID: 0,
        quantidade: 0,
        unidadeMercearia: "",
        unidadeDepartamento: "",
        fatorConversao: 0,
        totalLancado: 0,
      });
      setProdutoMerceariaBusca("");
      setMostrarSugestoesMercearia(false);
      setProdutoDepartamentoBusca("");
      setMostrarSugestoesDepartamento(false);
    }
  }

  const produtoGenericoSelecionadoId =
    itemAtual.produtoMerceariaID > 0
      ? produtosMercearia.find(
          (produto) => produto.id === itemAtual.produtoMerceariaID,
        )?.produto_generico_id
      : undefined;

  const produtosDepartamentoPorDepartamento =
    form.departamentoID > 0 && !isDepartamentoMercearia
      ? produtosDepartamento.filter(
          (produto) => produto.departamento_id === form.departamentoID,
        )
      : [];

  const produtosDepartamentoFiltrados = isQuebra
    ? produtosDepartamentoPorDepartamento
    : produtoGenericoSelecionadoId
      ? produtosDepartamento.filter(
          (produto) =>
            produto.produto_generico_id === produtoGenericoSelecionadoId,
        )
      : produtosDepartamento;

  function calcularSimilaridade(termo: string, valor: string) {
    const busca = termo.trim().toLowerCase();
    const texto = valor.toLowerCase();

    if (!busca) {
      return 0;
    }

    if (texto === busca) {
      return 1000;
    }

    if (texto.startsWith(busca)) {
      return 900 - texto.length;
    }

    if (texto.includes(busca)) {
      return 700 - texto.indexOf(busca);
    }

    return 0;
  }

  function ordenarPorSimilaridade<T>(
    lista: T[],
    termo: string,
    obterValores: (item: T) => string[],
  ) {
    const busca = termo.trim().toLowerCase();

    if (!busca) {
      return lista;
    }

    return [...lista].sort((a, b) => {
      const valoresA = obterValores(a)
        .filter((valor): valor is string => Boolean(valor))
        .map((valor) => calcularSimilaridade(busca, valor));
      const valoresB = obterValores(b)
        .filter((valor): valor is string => Boolean(valor))
        .map((valor) => calcularSimilaridade(busca, valor));

      const melhorA = Math.max(0, ...valoresA);
      const melhorB = Math.max(0, ...valoresB);

      return melhorB - melhorA;
    });
  }

  const produtosMerceariaFiltrados = ordenarPorSimilaridade(
    produtosMercearia,
    produtoMerceariaBusca,
    (produto) => [
      produto.descricao,
      produto.sku,
      produto.codigo_barras,
      produto.marca,
    ],
  ).filter((produto) => {
    const termo = produtoMerceariaBusca.trim().toLowerCase();

    if (!termo) {
      return true;
    }

    const valores = [
      produto.descricao,
      produto.sku,
      produto.codigo_barras,
      produto.marca,
    ].filter((valor): valor is string => Boolean(valor));

    return valores.some((valor) => valor.toLowerCase().includes(termo));
  });

  const produtosDepartamentoBuscaFiltrados = ordenarPorSimilaridade(
    produtosDepartamentoFiltrados,
    produtoDepartamentoBusca,
    (produto) => [
      produto.produto_generico_nome ?? "",
      produto.nome,
      produto.codigo,
      (produto as ProdutoDepartamento & { sku?: string }).sku ?? "",
    ],
  ).filter((produto) => {
    const termo = produtoDepartamentoBusca.trim().toLowerCase();

    if (!termo) {
      return true;
    }

    const valores = [
      produto.produto_generico_nome ?? "",
      produto.nome,
      produto.codigo,
      (produto as ProdutoDepartamento & { sku?: string }).sku ?? "",
    ].filter((valor): valor is string => Boolean(valor));

    return valores.some((valor) => valor.toLowerCase().includes(termo));
  });

  function selecionarProdutoDepartamento(produtoId: number) {
    const produto = produtosDepartamento.find((item) => item.id === produtoId);

    if (!produto) {
      return;
    }

    setProdutoDepartamentoBusca(produto.nome);
    setMostrarSugestoesDepartamento(false);
    setItemAtual((anterior) => ({
      ...anterior,
      produtoDepartamentoID: produto.id ?? 0,
      unidadeDepartamento: produto.unidade_medida ?? "",
      fatorConversao: 0,
      totalLancado: 0,
    }));
  }

  function handleProdutoDepartamentoBuscaChange(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const valor = e.target.value;
    const termo = valor.trim().toLowerCase();

    setProdutoDepartamentoBusca(valor);

    if (!termo) {
      setMostrarSugestoesDepartamento(false);
      setItemAtual((anterior) => ({
        ...anterior,
        produtoDepartamentoID: 0,
        unidadeDepartamento: "",
        fatorConversao: 0,
        totalLancado: 0,
      }));
      return;
    }

    setMostrarSugestoesDepartamento(true);
    setItemAtual((anterior) => ({
      ...anterior,
      produtoDepartamentoID: 0,
      unidadeDepartamento: "",
      fatorConversao: 0,
      totalLancado: 0,
    }));
  }

  function handleItemChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setItemAtual((anterior) => {
      const valorNumerico =
        name === "produtoMerceariaID" ||
        name === "produtoDepartamentoID" ||
        name === "quantidade"
          ? Number(value)
          : value;

      const proximo = {
        ...anterior,
        [name]: valorNumerico,
      };

      if (name === "produtoMerceariaID") {
        proximo.produtoDepartamentoID = 0;
        proximo.unidadeDepartamento = "";
        proximo.fatorConversao = 0;
        proximo.totalLancado = 0;
      }

      return proximo;
    });
  }

  function selecionarProdutoMercearia(
    produtoId: number,
    origem: "mercearia" | "departamento",
  ) {
    const produto =
      origem === "departamento"
        ? produtosDepartamento.find((item) => item.id === produtoId)
        : produtosMercearia.find((item) => item.id === produtoId);

    if (!produto) {
      return;
    }

    const nomeProduto = isProdutoDepartamento(produto)
      ? produto.nome
      : produto.descricao;

    setProdutoMerceariaBusca(nomeProduto);
    setMostrarSugestoesMercearia(false);
    setItemAtual((anterior) => ({
      ...anterior,
      produtoMerceariaID: origem === "mercearia" ? (produto.id ?? 0) : 0,
      produtoDepartamentoID: origem === "departamento" ? (produto.id ?? 0) : 0,
      unidadeMercearia:
        origem === "mercearia" ? (produto.unidade_medida ?? "") : "",
      unidadeDepartamento:
        origem === "departamento" ? (produto.unidade_medida ?? "") : "",
      fatorConversao: 0,
      totalLancado: 0,
    }));
  }

  function handleProdutoMerceariaBuscaChange(e: ChangeEvent<HTMLInputElement>) {
    const valor = e.target.value;
    const termo = valor.trim();

    setProdutoMerceariaBusca(valor);

    if (!termo) {
      setMostrarSugestoesMercearia(false);
      setItemAtual((anterior) => ({
        ...anterior,
        produtoMerceariaID: 0,
        produtoDepartamentoID: 0,
        unidadeMercearia: "",
        unidadeDepartamento: "",
        fatorConversao: 0,
        totalLancado: 0,
      }));
      return;
    }

    setMostrarSugestoesMercearia(true);
    setItemAtual((anterior) => ({
      ...anterior,
      produtoMerceariaID: 0,
      produtoDepartamentoID: 0,
      unidadeMercearia: "",
      unidadeDepartamento: "",
      fatorConversao: 0,
      totalLancado: 0,
    }));
  }

  function adicionarItem() {
    const possuiProdutoValido = isQuebra
      ? itemAtual.produtoMerceariaID > 0 || itemAtual.produtoDepartamentoID > 0
      : itemAtual.produtoMerceariaID > 0 && itemAtual.produtoDepartamentoID > 0;

    if (!possuiProdutoValido) {
      return;
    }

    if (itemAtual.quantidade <= 0) {
      return;
    }

    if (!isQuebra && itemAtual.fatorConversao <= 0) {
      return;
    }

    setForm((anterior) => {
      const itemExistente = anterior.itens.find(
        (item) =>
          item.produtoMerceariaID === itemAtual.produtoMerceariaID &&
          item.produtoDepartamentoID === itemAtual.produtoDepartamentoID,
      );

      if (itemExistente) {
        return {
          ...anterior,
          itens: anterior.itens.map((item) =>
            item === itemExistente
              ? { ...item, quantidade: item.quantidade + itemAtual.quantidade }
              : item,
          ),
        };
      }

      return {
        ...anterior,
        itens: [
          ...anterior.itens,
          {
            produtoMerceariaID: itemAtual.produtoMerceariaID,
            produtoDepartamentoID: itemAtual.produtoDepartamentoID,
            quantidade: itemAtual.quantidade,
            unidadeMercearia: itemAtual.unidadeMercearia,
            unidadeDepartamento: itemAtual.unidadeDepartamento,
            fatorConversao: itemAtual.fatorConversao,
            totalLancado: 0,
          },
        ],
      };
    });

    setItemAtual({
      produtoMerceariaID: 0,
      produtoDepartamentoID: 0,
      quantidade: 0,
      unidadeMercearia: "",
      unidadeDepartamento: "",
      fatorConversao: 0,
      totalLancado: 0,
    });
    setProdutoDepartamentoBusca("");
    setMostrarSugestoesDepartamento(false);
  }

  function removerItem(index: number) {
    setForm((anterior) => ({
      ...anterior,
      itens: anterior.itens.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.tipo) {
      return;
    }

    if (form.departamentoID <= 0) {
      return;
    }

    if (form.itens.length === 0) {
      return;
    }

    const payload: LancamentoPayload = {
      ...form,
      tipo: form.tipo as "TRANSFERENCIA" | "QUEBRA",

      itens: form.itens.map((item) => ({
        produtoMerceariaID: item.produtoMerceariaID,
        produtoDepartamentoID: item.produtoDepartamentoID,
        quantidade: item.quantidade,
      })),
    };

    setSalvando(true);

    try {
      await onSalvar(payload);

      setForm({
        departamentoID: 0,
        tipo: "",
        data: new Date(),
        itens: [],
      });
      setItemAtual({
        produtoMerceariaID: 0,
        produtoDepartamentoID: 0,
        quantidade: 0,
        unidadeMercearia: "",
        unidadeDepartamento: "",
        fatorConversao: 0,
        totalLancado: 0,
      });
      setProdutoMerceariaBusca("");
      setMostrarSugestoesMercearia(false);
      setProdutoDepartamentoBusca("");
      setMostrarSugestoesDepartamento(false);
      setTipoMensagem("sucesso");
      setMensagem(
        isQuebra
          ? "Quebra registrada com sucesso"
          : "Transferência registrada com sucesso",
      );
    } catch (error) {
      console.error("Erro ao criar lançamento:", error);
      setTipoMensagem("erro");
      setMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a transferência.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="card shadow-sm border-0 rounded-3 p-3 p-md-4"
      >
        <div className="row g-3 g-md-4">
          {/* Tipo do lançamento */}
          <div className="col-12 col-md-6">
            <label htmlFor="tipo" className="form-label fw-semibold">
              Tipo do lançamento
            </label>

            <select
              id="tipo"
              name="tipo"
              className="form-select"
              value={form.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="TRANSFERENCIA">Transferência</option>
              <option value="QUEBRA">Quebra</option>
            </select>
          </div>

          {/* Departamento */}
          <div className="col-12 col-md-6">
            <label htmlFor="departamentoID" className="form-label fw-semibold">
              Departamento
            </label>

            <select
              id="departamentoID"
              name="departamentoID"
              className="form-select"
              value={form.departamentoID}
              onChange={handleChange}
            >
              <option value={0}>Selecione um departamento</option>

              {departamentosDisponiveis.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>
                  {departamento.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Produto Mercearia */}
          {isQuebra ? (
            <div className="col-12 col-md-6">
              <label
                htmlFor="produtoMerceariaBusca"
                className="form-label fw-semibold"
              >
                {isDepartamentoMercearia
                  ? "Produto da mercearia"
                  : "Produto do departamento"}
              </label>

              <input
                id="produtoMerceariaBusca"
                type="text"
                className="form-control"
                placeholder="Buscar por SKU, código ou nome"
                value={produtoMerceariaBusca}
                onChange={handleProdutoMerceariaBuscaChange}
                onFocus={() =>
                  produtoMerceariaBusca.trim() &&
                  setMostrarSugestoesMercearia(true)
                }
                autoComplete="off"
                disabled={isQuebra && !isDepartamentoMercearia}
              />

              {mostrarSugestoesMercearia && produtoMerceariaBusca.trim() && (
                <div className="list-group mt-2">
                  {(isQuebra && !isDepartamentoMercearia
                    ? produtosDepartamentoBuscaFiltrados
                    : produtosMerceariaFiltrados
                  )
                    .slice(0, 6)
                    .map((produto) => (
                      <button
                        key={produto.id}
                        type="button"
                        className={`list-group-item list-group-item-action text-start ${
                          (
                            isProdutoDepartamento(produto)
                              ? produto.id === itemAtual.produtoDepartamentoID
                              : produto.id === itemAtual.produtoMerceariaID
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          selecionarProdutoMercearia(
                            produto.id ?? 0,
                            isProdutoDepartamento(produto)
                              ? "departamento"
                              : "mercearia",
                          )
                        }
                      >
                        <div className="d-flex justify-content-between align-items-center gap-2">
                          <div className="fw-semibold">
                            {isProdutoDepartamento(produto)
                              ? produto.nome
                              : produto.descricao}
                          </div>
                          {(isProdutoDepartamento(produto)
                            ? produto.id === itemAtual.produtoDepartamentoID
                            : produto.id === itemAtual.produtoMerceariaID) && (
                            <span className="badge text-bg-light text-primary">
                              Selecionado
                            </span>
                          )}
                        </div>
                        <small className="text-muted">
                          {isProdutoDepartamento(produto)
                            ? `Código: ${produto.codigo} · ${produto.produto_generico_nome ?? ""}`
                            : `SKU: ${produto.sku} · Código: ${produto.codigo_barras}`}
                        </small>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="col-12 col-md-6">
              <label
                htmlFor="produtoMerceariaBusca"
                className="form-label fw-semibold"
              >
                Produto da Mercearia
              </label>

              <input
                id="produtoMerceariaBusca"
                type="text"
                className="form-control"
                placeholder="Buscar por SKU, código ou nome"
                value={produtoMerceariaBusca}
                onChange={handleProdutoMerceariaBuscaChange}
                onFocus={() =>
                  produtoMerceariaBusca.trim() &&
                  setMostrarSugestoesMercearia(true)
                }
                autoComplete="off"
              />

              {mostrarSugestoesMercearia && produtoMerceariaBusca.trim() && (
                <div className="list-group mt-2">
                  {produtosMerceariaFiltrados.slice(0, 6).map((produto) => (
                    <button
                      key={produto.id}
                      type="button"
                      className={`list-group-item list-group-item-action text-start ${
                        produto.id === itemAtual.produtoMerceariaID
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        selecionarProdutoMercearia(produto.id ?? 0, "mercearia")
                      }
                    >
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <div className="fw-semibold">{produto.descricao}</div>
                        {produto.id === itemAtual.produtoMerceariaID && (
                          <span className="badge text-bg-light text-primary">
                            Selecionado
                          </span>
                        )}
                      </div>
                      <small className="text-muted">
                        SKU: {produto.sku} · Código: {produto.codigo_barras}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Produto Departamento */}
          <div className="col-12 col-md-6">
            <label
              htmlFor="produtoDepartamentoBusca"
              className="form-label fw-semibold"
            >
              Produto do Departamento
            </label>

            <input
              id="produtoDepartamentoBusca"
              type="text"
              className="form-control"
              placeholder="Buscar por nome, SKU ou código"
              value={produtoDepartamentoBusca}
              onChange={handleProdutoDepartamentoBuscaChange}
              onFocus={() =>
                produtoDepartamentoBusca.trim() &&
                setMostrarSugestoesDepartamento(true)
              }
              autoComplete="off"
              disabled={isQuebra && isDepartamentoMercearia}
            />

            {mostrarSugestoesDepartamento &&
              produtoDepartamentoBusca.trim() && (
                <div className="list-group mt-2">
                  {produtosDepartamentoBuscaFiltrados
                    .slice(0, 6)
                    .map((produto) => (
                      <button
                        key={produto.id}
                        type="button"
                        className={`list-group-item list-group-item-action text-start ${
                          produto.id === itemAtual.produtoDepartamentoID
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          selecionarProdutoDepartamento(produto.id ?? 0)
                        }
                      >
                        <div className="d-flex justify-content-between align-items-center gap-2">
                          <div className="fw-semibold">{produto.nome}</div>
                          {produto.id === itemAtual.produtoDepartamentoID && (
                            <span className="badge text-bg-light text-primary">
                              Selecionado
                            </span>
                          )}
                        </div>
                        <small className="text-muted">
                          Código: {produto.codigo} ·{" "}
                          {produto.produto_generico_nome ?? ""}
                        </small>
                      </button>
                    ))}
                </div>
              )}
          </div>

          {/* Quantidade */}
          <div className="col-12 col-md-4">
            <label htmlFor="quantidade" className="form-label fw-semibold">
              Quantidade
            </label>

            <input
              id="quantidade"
              name="quantidade"
              type="number"
              min="0"
              step="0.001"
              className="form-control"
              value={itemAtual.quantidade}
              onChange={handleItemChange}
            />
          </div>

          <div className="col-12 col-md-8 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={adicionarItem}
              disabled={
                carregandoConversao ||
                (!isQuebra && itemAtual.fatorConversao <= 0)
              }
            >
              Adicionar item
            </button>
          </div>

          {/* Informações retornadas pelo backend */}
          {itemAtual.fatorConversao > 0 && (
            <div className="col-12">
              <div className="alert alert-primary border rounded-3 mb-0">
                <div className="row g-2">
                  <div className="col-12 col-md-4">
                    <strong>Origem:</strong>{" "}
                    {itemAtual.unidadeMercearia == "g" ? "GR" : "KG"}
                  </div>
                  <div className="col-12 col-md-4">
                    <strong>Destino:</strong> {itemAtual.unidadeDepartamento}
                  </div>
                  <div className="col-12 col-md-4">
                    <strong>Fator:</strong> {itemAtual.fatorConversao}
                  </div>
                </div>
              </div>
            </div>
          )}

          {carregandoConversao && (
            <div className="col-12">
              <div className="alert alert-info mb-0">
                Calculando conversão...
              </div>
            </div>
          )}

          {/* Lista dos itens */}
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
              <h4 className="h5 mb-0">
                Itens {isQuebra ? "da Quebra" : "da Transferência"}
              </h4>
              <span className="badge text-bg-secondary">
                {form.itens.length} {form.itens.length === 1 ? "item" : "itens"}
              </span>
            </div>

            {form.itens.length === 0 ? (
              <div className="alert alert-light border text-body-secondary mb-0">
                Nenhum item adicionado ainda.
              </div>
            ) : (
              <div className="table-responsive bg-white rounded-3 shadow-sm">
                <table className="table table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Produto</th>
                      {form.tipo === "TRANSFERENCIA" ? (
                        <>
                          <th>Código origem (SKU | C. Barras)</th>
                          <th>Código destino (Código | SKU)</th>
                        </>
                      ) : (
                        <th>Produto lançado</th>
                      )}
                      <th>Quantidade</th>
                      <th className="text-end">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.itens.map((item, index) => {
                      const produtoM = produtosMercearia.find(
                        (produto) => produto.id === item.produtoMerceariaID,
                      );
                      const produtoD = produtosDepartamento.find(
                        (produto) => produto.id === item.produtoDepartamentoID,
                      );
                      const nomeProdutoO =
                        produtoM?.descricao ?? produtoD?.nome;
                      const codigoProdutoO = produtoM
                        ? `${produtoM.sku} · ${produtoM.codigo_barras}`
                        : (produtoD?.codigo ?? "-");
                      const codigoProdutoD =
                        form.tipo === "TRANSFERENCIA"
                          ? produtoD
                            ? `${produtoD.codigo} · ${produtoD.nome}`
                            : "-"
                          : "-";

                      return (
                        <tr key={index}>
                          <td className="fw-semibold">{nomeProdutoO}</td>
                          {form.tipo === "TRANSFERENCIA" ? (
                            <>
                              <td>{codigoProdutoO}</td>
                              <td>{codigoProdutoD}</td>
                            </>
                          ) : (
                            <td>
                              {produtoM ? produtoM.sku : produtoD?.codigo}
                            </td>
                          )}
                          <td>
                            {item.quantidade}
                            {form.tipo === "TRANSFERENCIA"
                              ? ` ${item.unidadeMercearia}`
                              : ` ${item.unidadeMercearia || item.unidadeDepartamento}`}
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removerItem(index)}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="d-grid mt-4">
          <button
            type="submit"
            className="btn btn-success btn-lg"
            disabled={salvando}
          >
            {salvando
              ? "Registrando..."
              : isQuebra
                ? "Registrar quebra"
                : "Registrar transferência"}
          </button>
        </div>

        {mensagem && (
          <>
            <div
              className="modal-backdrop fade show"
              onClick={() => setMensagem("")}
            />
            <div
              className="modal d-block lancamento-feedback-modal"
              role="dialog"
              aria-modal="true"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div
                    className={`modal-header ${
                      tipoMensagem === "sucesso"
                        ? "bg-success text-white"
                        : "bg-danger text-white"
                    }`}
                  >
                    <h5 className="modal-title">
                      {tipoMensagem === "sucesso" ? "Sucesso" : "Erro"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white lancamento-feedback-close"
                      aria-label="Fechar"
                      onClick={() => setMensagem("")}
                    />
                  </div>
                  <div className="modal-body">{mensagem}</div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary lancamento-feedback-button"
                      onClick={() => setMensagem("")}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </>
  );
}

export default LancamentoForm;
