import { useState } from "react";
import type { SubmitEventHandler } from "react";
import type { Produto } from "../../types/Produto";

interface ProdutoFormProps {
  produto?: Produto;
  onSalvar: (produto: Produto) => Promise<void>;
}

function ProdutoForm({ produto, onSalvar }: ProdutoFormProps) {
  const [erro, setErro] = useState<string>("");
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [codigo, setCodigo] = useState(produto?.codigo ?? "");
  const [salvando, setSalvando] = useState(false);

  const salvarProduto: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!nome.trim() || !codigo.trim()) {
      setErro("Nome e código são obrigatórios");
      return;
    }

    setErro("");

    const produto: Produto = {
      nome: nome.trim(),
      codigo: codigo.trim(),
    };
    try {
      setSalvando(true);
      await onSalvar(produto);

      setErro("");
      setNome("");
      setCodigo("");
    } catch {
      setErro("Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <form onSubmit={salvarProduto}>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            value={nome}
            onChange={(event) => {
              setNome(event.target.value);
              setErro("");
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Codigo</label>
          <input
            type="text"
            className="form-control"
            value={codigo}
            onChange={(event) => {
              setCodigo(event.target.value);
              setErro("");
            }}
          />
        </div>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <div className="mb-3">
          <button className="btn btn-primary" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </>
  );
}

export default ProdutoForm;
