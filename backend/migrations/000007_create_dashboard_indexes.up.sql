CREATE INDEX IF NOT EXISTS idx_lancamentos_dashboard_filtros
    ON lancamentos (tipo, data_lancamento, departamento_id);

CREATE INDEX IF NOT EXISTS idx_lancamento_itens_dashboard_lancamento
    ON lancamento_itens (lancamento_id);

CREATE INDEX IF NOT EXISTS idx_lancamento_itens_dashboard_produtos
    ON lancamento_itens (produto_mercearia_id, produto_departamento_id);

CREATE INDEX IF NOT EXISTS idx_produtos_mercearia_dashboard_generico
    ON produtos_mercearia (produto_generico_id);

CREATE INDEX IF NOT EXISTS idx_produtos_departamento_dashboard_generico
    ON produtos_departamento (produto_generico_id);