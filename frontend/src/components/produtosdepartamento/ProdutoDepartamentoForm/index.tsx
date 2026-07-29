import { useEffect, useState } from "react";

import type { Produto } from "../../../types/Produto";
import type { Departamento } from "../../../types/Departamento";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

interface ProdutoDepartamentoFormProps {
  produto?: ProdutoDepartamento;

  produtosBase: Produto[];

  departamentos: Departamento[];

  onSalvar: (produto: ProdutoDepartamento) => Promise<void>;
}

function ProdutoDepartamentoForm({
  produto,
  produtosBase,
  departamentos,
  onSalvar,
}: ProdutoDepartamentoFormProps) {
  const [form, setForm] = useState<ProdutoDepartamento>({
    produto_base_id: 0,
    departamento_id: 0,

    nome: "",
    codigo: "",

    unidade: "",

    fator_conversao: 1,
  });

  useEffect(() => {
    if (produto) {
      setForm(produto);
    } else {
      setForm({
        produto_base_id: 0,
        departamento_id: 0,

        nome: "",
        codigo: "",

        unidade: "",

        fator_conversao: 1,
      });
    }
  }, [produto]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    if (name === "produto_base_id") {
      const id = Number(value);

      setForm((anterior) => ({
        ...anterior,

        produto_base_id: id,
      }));

      return;
    }

    setForm((anterior) => ({
      ...anterior,

      [name]:
        name === "departamento_id" || name === "fator_conversao"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await onSalvar(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Produto Base</label>

        <select
          className="form-select"
          name="produto_base_id"
          value={form.produto_base_id}
          onChange={handleChange}
          required
        >
          <option value={0}>Selecione...</option>

          {produtosBase.map((produto) => (
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
          name="unidade"
          value={form.unidade}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Fator de Conversão</label>

        <input
          type="number"
          className="form-control"
          name="fator_conversao"
          step="0.0001"
          min="0.0001"
          value={form.fator_conversao}
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
