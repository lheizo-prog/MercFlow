import { useState } from "react";
import type { SubmitEventHandler } from "react";
import type { Produto } from "../../types/Produto";

interface ProdutoFormProps {
  onSalvar: (produto: Produto) => void;
}

function ProdutoForm(props: ProdutoFormProps) {
  const [nome, setNome] = useState<string>("");
  const [codigo, setCodigo] = useState<string>("");

  const salvarProduto: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const produto: Produto = {
      id: 0,
      nome,
      codigo,
    };

    props.onSalvar(produto);
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
            onChange={(event) => setNome(event.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Codigo</label>
          <input
            type="text"
            className="form-control"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
          />
        </div>
        <div className="mb-3">
          <button className="btn btn-primary" type="submit">
            Salvar
          </button>
        </div>
      </form>
    </>
  );
}

export default ProdutoForm;
