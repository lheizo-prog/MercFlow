import { useEffect, useState } from "react";

import type { ProdutoGenerico } from "../../../types/ProdutoGenerico";
import type { ProdutoMercearia } from "../../../types/ProdutoMercearia";

interface ProdutoMerceariaFormProps {
  produto?: ProdutoMercearia;
  produtosGenericos: ProdutoGenerico[];
  onSalvar: (produto: ProdutoMercearia) => Promise<void>;
}

function ProdutoMerceariaForm({
  produto,
  produtosGenericos,
  onSalvar,
}: ProdutoMerceariaFormProps) {
  const [form, setForm] = useState<ProdutoMercearia>({
    produto_generico_id: 0,
    sku: "",
    marca: "",
    descricao: "",
    codigo_barras: "",
    quantidade_embalagem: 0,
    unidade_medida: "",
  });

  useEffect(() => {
    if (produto) {
      setForm({
        id: produto.id,
        produto_generico_id: produto.produto_generico_id,
        produto_generico_nome: produto.produto_generico_nome,
        sku: produto.sku,
        marca: produto.marca,
        descricao: produto.descricao,
        codigo_barras: produto.codigo_barras,
        quantidade_embalagem: produto.quantidade_embalagem,
        unidade_medida: produto.unidade_medida,
        ativo: produto.ativo,
      });
    } else {
      setForm({
        produto_generico_id: 0,
        sku: "",
        marca: "",
        descricao: "",
        codigo_barras: "",
        quantidade_embalagem: 0,
        unidade_medida: "",
      });
    }
  }, [produto]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setForm((anterior) => ({
      ...anterior,
      [name]:
        name === "produto_generico_id" || name === "quantidade_embalagem"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log("EDIT/CADASTRO - formulário submetido");
    console.log("Produto enviado:", form);

    try {
      await onSalvar(form);
      console.log("EDIT/CADASTRO - onSalvar terminou");
    } catch (error) {
      console.error("EDIT/CADASTRO - erro no onSalvar:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {" "}
      <div className="mb-3">
        {" "}
        <label className="form-label">Produto Base</label>
        ```
        <select
          className="form-select"
          name="produto_generico_id"
          value={form.produto_generico_id}
          onChange={handleChange}
          required
        >
          <option value={0}>Selecione...</option>

          {produtosGenericos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">SKU</label>

        <input
          className="form-control"
          type="text"
          name="sku"
          value={form.sku}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Marca</label>

        <input
          className="form-control"
          type="text"
          name="marca"
          value={form.marca}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Descrição</label>

        <input
          className="form-control"
          type="text"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Código de Barras</label>

        <input
          className="form-control"
          type="text"
          name="codigo_barras"
          value={form.codigo_barras}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Quantidade da Embalagem</label>

        <input
          className="form-control"
          type="number"
          name="quantidade_embalagem"
          value={form.quantidade_embalagem}
          onChange={handleChange}
          min="0"
          step="0.0001"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Unidade de Medida</label>

        <input
          className="form-control"
          type="text"
          name="unidade_medida"
          value={form.unidade_medida}
          onChange={handleChange}
          required
        />
      </div>
      <div className="text-end">
        <button className="btn btn-primary" type="submit">
          Salvar
        </button>
      </div>
    </form>
  );
}

export default ProdutoMerceariaForm;
