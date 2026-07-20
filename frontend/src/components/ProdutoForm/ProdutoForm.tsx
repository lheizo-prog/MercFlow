import { useState } from "react";
import type { SubmitEventHandler } from "react";
import type { Produto } from "../../types/Produto";

interface ProdutoFormProps {
  produto?: Produto;
  onSalvar: (produto: Produto) => Promise<void>;
}

function ProdutoForm({ produto, onSalvar }: ProdutoFormProps) {
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState<Produto>({
    id: produto?.id ?? 0,
    nome: produto?.nome ?? "",
    codigo: produto?.codigo ?? "",
  });

  const salvarProduto: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!form.nome.trim() || !form.codigo.trim()) {
      setErro("Nome e código são obrigatórios.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      await onSalvar({
        ...form,
        nome: form.nome.trim(),
        codigo: form.codigo.trim(),
      });

      setForm({
        id: 0,
        nome: "",
        codigo: "",
      });
    } catch {
      setErro("Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvarProduto}>
      <div className="mb-3">
        <label className="form-label">Nome</label>

        <input
          type="text"
          className="form-control"
          value={form.nome}
          disabled={salvando}
          onChange={(e) =>
            setForm({
              ...form,
              nome: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Código</label>

        <input
          type="text"
          className="form-control"
          value={form.codigo}
          disabled={salvando}
          onChange={(e) =>
            setForm({
              ...form,
              codigo: e.target.value,
            })
          }
        />
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="d-flex justify-content-end">
        <button className="btn btn-primary" type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default ProdutoForm;
