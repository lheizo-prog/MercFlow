import { useEffect, useState } from "react";

import type { ProdutoGenerico } from "../../../types/ProdutoGenerico";
import type { Departamento } from "../../../types/Departamento";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

interface ProdutoDepartamentoFormProps {
  produto?: ProdutoDepartamento;

  produtosGenericos: ProdutoGenerico[];
  departamentos: Departamento[];

  onSalvar: (produto: ProdutoDepartamento) => Promise<void>;
}

function ProdutoDepartamentoForm({
  produto,
  produtosGenericos,
  departamentos,
  onSalvar,
}: ProdutoDepartamentoFormProps) {
  const [form, setForm] = useState<ProdutoDepartamento>({
    produto_generico_id: 0,
    departamento_id: 0,

    nome: "",
    codigo: "",

    unidade_medida: "",
  });

  useEffect(() => {
    if (produto) {
      setForm(produto);
    } else {
      setForm({
        produto_generico_id: 0,
        departamento_id: 0,

        nome: "",
        codigo: "",

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
        name === "produto_generico_id" || name === "departamento_id"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    await onSalvar(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Produto Base</label>

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
        <label className="form-label">Departamento</label>

        <select
          className="form-select"
          name="departamento_id"
          value={form.departamento_id}
          onChange={handleChange}
          required
        >
          <option value={0}>Selecione...</option>

          {departamentos.map((departamento) => (
            <option key={departamento.id} value={departamento.id}>
              {departamento.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Nome</label>

        <input
          className="form-control"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Código</label>

        <input
          className="form-control"
          name="codigo"
          value={form.codigo}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Unidade</label>

        <input
          className="form-control"
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

export default ProdutoDepartamentoForm;
