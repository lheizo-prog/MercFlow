import { useState } from "react";
import type { SubmitEventHandler } from "react";
import type { Departamento } from "../../../types/Departamento";

interface DepartamentoFormProps {
  departamento?: Departamento;
  onSalvar: (departamento: Departamento) => Promise<void>;
}

function DepartamentoForm({ departamento, onSalvar }: DepartamentoFormProps) {
  const [erro, setErro] = useState<string>("");
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState<Departamento>({
    id: departamento?.id ?? 0,
    nome: departamento?.nome ?? "",
  });

  const salvarDepartamento: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event?.preventDefault();

    if (!form.nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }

    setErro("");
    setSalvando(true);

    const departamentoSalvar: Departamento = {
      ...form,
      nome: form.nome.trim(),
    };
    try {
      setSalvando(true);
      await onSalvar(departamentoSalvar);

      setForm({
        id: 0,
        nome: "",
      });
    } catch {
      setErro("Não foi possível salvar departamento.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvarDepartamento}>
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

      {erro && <div className="alet alert-danger">{erro}</div>}

      <div className="d-flex justify-content-end">
        <button className="btn btn-primary" type="submit" disabled={salvando}>
          {salvando ? "Salvando...." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default DepartamentoForm;
