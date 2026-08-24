function DashboardPage() {
  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <p className="text-uppercase text-primary fw-semibold small mb-1">
          Visão geral
        </p>
        <h1 className="display-6 fw-semibold mb-2">Dashboard</h1>
        <p className="text-body-secondary mb-0">
          Acesse rapidamente as principais áreas da operação.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <span className="badge text-bg-primary mb-3">Cadastros</span>
              <h2 className="h5">Produtos genéricos</h2>
              <p className="text-body-secondary small">
                Mantenha a base de produtos usada no estoque.
              </p>
              <a
                className="btn btn-outline-primary btn-sm"
                href="/produtos_genericos"
              >
                Acessar produtos
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <span className="badge text-bg-info mb-3">Estoque</span>
              <h2 className="h5">Produtos da mercearia</h2>
              <p className="text-body-secondary small">
                Consulte SKUs, embalagens e códigos de barras.
              </p>
              <a
                className="btn btn-outline-info btn-sm"
                href="/produtos_mercearia"
              >
                Acessar mercearia
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <span className="badge text-bg-success mb-3">Operação</span>
              <h2 className="h5">Novo lançamento</h2>
              <p className="text-body-secondary small">
                Registre transferências e quebras de estoque.
              </p>
              <a className="btn btn-outline-success btn-sm" href="/lancamentos">
                Registrar lançamento
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
