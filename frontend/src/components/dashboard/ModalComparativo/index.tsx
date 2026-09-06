import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import lojaService from "../../../services/lojaService";
import type { Loja } from "../../../types/Loja";
import type {
  ComparativoDuasLojasConfig,
  ComparativoMesmaLojaConfig,
  ComparativoRange,
  ComparativoLojaSelecionada,
} from "../../../types/Comparativo";

type ComparativoConfig = ComparativoDuasLojasConfig | ComparativoMesmaLojaConfig;

interface Props {
  show: boolean;
  onHide: () => void;
  onGerar: (config: ComparativoConfig) => void;
}

const rangeVazio = (): ComparativoRange => ({ dataInicio: "", dataFim: "" });

export function ModalComparativo({ show, onHide, onGerar }: Props) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [modo, setModo] = useState<"duas_lojas" | "mesma_loja">("duas_lojas");
  const [tipo, setTipo] = useState<"" | "QUEBRA" | "TRANSFERENCIA">("");

  // Modo duas_lojas
  const [lojaA, setLojaA] = useState<ComparativoLojaSelecionada | undefined>(undefined);
  const [lojaB, setLojaB] = useState<ComparativoLojaSelecionada | undefined>(undefined);
  const [rangeA_2, setRangeA_2] = useState<ComparativoRange>(rangeVazio());
  const [rangeB_2, setRangeB_2] = useState<ComparativoRange>(rangeVazio());
  const [usarDatasIguais, setUsarDatasIguais] = useState(false);
  const [rangeUnico, setRangeUnico] = useState<ComparativoRange>(rangeVazio());

  // Modo mesma_loja
  const [loja, setLoja] = useState<ComparativoLojaSelecionada | undefined>(undefined);
  const [rangeA_1, setRangeA_1] = useState<ComparativoRange>(rangeVazio());
  const [rangeB_1, setRangeB_1] = useState<ComparativoRange>(rangeVazio());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      lojaService.listar()
        .then((res) => setLojas(res.filter((l) => l.ativo)))
        .catch(() => setLojas([]));
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      setErrors({});
      setSubmitting(false);
    }
  }, [show]);

  function validar(): boolean {
    const errs: Record<string, string> = {};

    if (modo === "duas_lojas") {
      if (!lojaA) errs.lojaA = "Selecione a Loja A";
      if (!lojaB) errs.lojaB = "Selecione a Loja B";
      if (lojaA && lojaB && lojaA.id === lojaB.id) {
        errs.lojaB = "As lojas devem ser diferentes";
      }

      if (usarDatasIguais) {
        if (!rangeUnico.dataInicio) errs.rangeUnico = "Informe a data de inicio";
        if (rangeUnico.dataInicio && rangeUnico.dataFim && rangeUnico.dataFim < rangeUnico.dataInicio) {
          errs.rangeUnico = "Data fim deve ser maior que inicio";
        }
      } else {
        if (!rangeA_2.dataInicio) errs.rangeA = "Informe a data de inicio";
        if (rangeA_2.dataInicio && rangeA_2.dataFim && rangeA_2.dataFim < rangeA_2.dataInicio) {
          errs.rangeA = "Data fim deve ser maior que inicio";
        }
        if (!rangeB_2.dataInicio) errs.rangeB = "Informe a data de inicio";
        if (rangeB_2.dataInicio && rangeB_2.dataFim && rangeB_2.dataFim < rangeB_2.dataInicio) {
          errs.rangeB = "Data fim deve ser maior que inicio";
        }
      }
    } else {
      if (!loja) errs.loja = "Selecione a loja";
      if (!rangeA_1.dataInicio) errs.rangeA = "Informe a data de inicio do Periodo A";
      if (rangeA_1.dataInicio && rangeA_1.dataFim && rangeA_1.dataFim < rangeA_1.dataInicio) {
        errs.rangeA = "Data fim deve ser maior que inicio";
      }
      if (!rangeB_1.dataInicio) errs.rangeB = "Informe a data de inicio do Periodo B";
      if (rangeB_1.dataInicio && rangeB_1.dataFim && rangeB_1.dataFim < rangeB_1.dataInicio) {
        errs.rangeB = "Data fim deve ser maior que inicio";
      }
      if (rangeA_1.dataInicio && rangeB_1.dataInicio) {
        const fimA = rangeA_1.dataFim || rangeA_1.dataInicio;
        const inicioB = rangeB_1.dataInicio;
        if (fimA >= inicioB) {
          errs.rangeB = "Periodo B deve comecar apos o fim do Periodo A";
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validar()) return;
    setSubmitting(true);

    let config: ComparativoConfig;

    if (modo === "duas_lojas") {
      const cfg: ComparativoDuasLojasConfig = {
        modo: "duas_lojas",
        tipo,
        usarDatasIguais,
        lojaA: lojaA!,
        lojaB: lojaB!,
        rangeA: usarDatasIguais ? rangeUnico : rangeA_2,
        rangeB: usarDatasIguais ? rangeUnico : rangeB_2,
      };
      config = cfg;
    } else {
      const cfg: ComparativoMesmaLojaConfig = {
        modo: "mesma_loja",
        tipo,
        usarDatasIguais: false,
        loja: loja!,
        rangeA: rangeA_1,
        rangeB: rangeB_1,
      };
      config = cfg;
    }

    onGerar(config);
    setSubmitting(false);
  }

  function handleClose() {
    setErrors({});
    onHide();
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
          </svg>
          Configurar Comparativo
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4">
          <label className="form-label small fw-semibold text-body-secondary mb-2">Modo de Comparacao</label>
          <div className="d-flex flex-column gap-2">
            <Form.Check
              type="radio"
              id="modo-duas-lojas"
              label="Comparar duas lojas diferentes"
              checked={modo === "duas_lojas"}
              onChange={() => setModo("duas_lojas")}
            />
            <Form.Check
              type="radio"
              id="modo-mesma-loja"
              label="Comparar a mesma loja em periodos diferentes"
              checked={modo === "mesma_loja"}
              onChange={() => setModo("mesma_loja")}
            />
          </div>
        </div>

        <hr />

        <div className="mb-4">
          <label className="form-label small fw-semibold text-body-secondary mb-2 d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-1">
              <path d="M3 2v4.586l7 7L14.586 9l-7-7H3zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2z"/>
            </svg>
            Tipo de Lancamento
          </label>
          <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value as "" | "QUEBRA" | "TRANSFERENCIA")}>
            <option value="">Todos os tipos</option>
            <option value="QUEBRA">Quebra</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        {modo === "duas_lojas" && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold text-body-secondary">Loja A</label>
                <select
                  className={`form-select ${errors.lojaA ? "is-invalid" : ""}`}
                  value={lojaA?.id ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const l = lojas.find((x) => x.id === id);
                    setLojaA(l ? { id: l.id, nome: l.nome } : undefined);
                  }}
                >
                  <option value="">Selecione a loja</option>
                  {lojas.map((l) => (
                    <option key={l.id} value={l.id} disabled={lojaB?.id === l.id}>
                      {l.nome}{lojaB?.id === l.id ? " (ja selecionada)" : ""}
                    </option>
                  ))}
                </select>
                {errors.lojaA && <div className="invalid-feedback">{errors.lojaA}</div>}
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold text-body-secondary">Loja B</label>
                <select
                  className={`form-select ${errors.lojaB ? "is-invalid" : ""}`}
                  value={lojaB?.id ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const l = lojas.find((x) => x.id === id);
                    setLojaB(l ? { id: l.id, nome: l.nome } : undefined);
                  }}
                >
                  <option value="">Selecione a loja</option>
                  {lojas.map((l) => (
                    <option key={l.id} value={l.id} disabled={lojaA?.id === l.id}>
                      {l.nome}{lojaA?.id === l.id ? " (ja selecionada)" : ""}
                    </option>
                  ))}
                </select>
                {errors.lojaB && <div className="invalid-feedback">{errors.lojaB}</div>}
              </div>
            </div>

            <div className="mb-3">
              <Form.Check
                type="checkbox"
                id="usar-datas-iguais"
                label="Usar o mesmo periodo de datas para ambas as lojas"
                checked={usarDatasIguais}
                onChange={(e) => setUsarDatasIguais(e.target.checked)}
              />
            </div>

            {usarDatasIguais ? (
              <div className="p-3 bg-light rounded mb-3">
                <label className="form-label small fw-semibold text-body-secondary">Periodo</label>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small text-body-secondary">Data Inicio</label>
                    <input type="date" className="form-control form-control-sm" value={rangeUnico.dataInicio}
                      onChange={(e) => setRangeUnico({ ...rangeUnico, dataInicio: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-body-secondary">Data Fim</label>
                    <input type="date" className="form-control form-control-sm" value={rangeUnico.dataFim}
                      onChange={(e) => setRangeUnico({ ...rangeUnico, dataFim: e.target.value })} />
                  </div>
                </div>
                {errors.rangeUnico && <div className="text-danger small mt-1">{errors.rangeUnico}</div>}
              </div>
            ) : (
              <>
                <div className="p-3 bg-light rounded mb-3">
                  <label className="form-label small fw-semibold text-body-secondary">Periodo - Loja A</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Inicio</label>
                      <input type="date" className="form-control form-control-sm" value={rangeA_2.dataInicio}
                        onChange={(e) => setRangeA_2({ ...rangeA_2, dataInicio: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Fim</label>
                      <input type="date" className="form-control form-control-sm" value={rangeA_2.dataFim}
                        onChange={(e) => setRangeA_2({ ...rangeA_2, dataFim: e.target.value })} />
                    </div>
                  </div>
                  {errors.rangeA && <div className="text-danger small mt-1">{errors.rangeA}</div>}
                </div>
                <div className="p-3 bg-light rounded">
                  <label className="form-label small fw-semibold text-body-secondary">Periodo - Loja B</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Inicio</label>
                      <input type="date" className="form-control form-control-sm" value={rangeB_2.dataInicio}
                        onChange={(e) => setRangeB_2({ ...rangeB_2, dataInicio: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Fim</label>
                      <input type="date" className="form-control form-control-sm" value={rangeB_2.dataFim}
                        onChange={(e) => setRangeB_2({ ...rangeB_2, dataFim: e.target.value })} />
                    </div>
                  </div>
                  {errors.rangeB && <div className="text-danger small mt-1">{errors.rangeB}</div>}
                </div>
              </>
            )}
          </>
        )}

        {modo === "mesma_loja" && (
          <>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-body-secondary">Loja</label>
              <select
                className={`form-select ${errors.loja ? "is-invalid" : ""}`}
                value={loja?.id ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const l = lojas.find((x) => x.id === id);
                  setLoja(l ? { id: l.id, nome: l.nome } : undefined);
                }}
              >
                <option value="">Selecione a loja</option>
                {lojas.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
              {errors.loja && <div className="invalid-feedback">{errors.loja}</div>}
              <div className="form-text small">Cada periodo tera seu proprio intervalo de datas</div>
            </div>

            <div className="p-3 bg-light rounded mb-3">
              <label className="form-label small fw-semibold text-primary">Periodo A (mais antigo)</label>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small text-body-secondary">Data Inicio</label>
                  <input type="date" className="form-control form-control-sm" value={rangeA_1.dataInicio}
                    onChange={(e) => setRangeA_1({ ...rangeA_1, dataInicio: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small text-body-secondary">Data Fim</label>
                  <input type="date" className="form-control form-control-sm" value={rangeA_1.dataFim}
                    onChange={(e) => setRangeA_1({ ...rangeA_1, dataFim: e.target.value })} />
                </div>
              </div>
              {errors.rangeA && <div className="text-danger small mt-1">{errors.rangeA}</div>}
            </div>

            <div className="p-3 bg-light rounded">
              <label className="form-label small fw-semibold text-success">Periodo B (mais recente)</label>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small text-body-secondary">Data Inicio</label>
                  <input type="date" className="form-control form-control-sm" value={rangeB_1.dataInicio}
                    onChange={(e) => setRangeB_1({ ...rangeB_1, dataInicio: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small text-body-secondary">Data Fim</label>
                  <input type="date" className="form-control form-control-sm" value={rangeB_1.dataFim}
                    onChange={(e) => setRangeB_1({ ...rangeB_1, dataFim: e.target.value })} />
                </div>
              </div>
              {errors.rangeB && <div className="text-danger small mt-1">{errors.rangeB}</div>}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Gerando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                <path d="M8 3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              Gerar Comparativo
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
