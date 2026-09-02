ALTER TABLE produtos_genericos ADD COLUMN loja_id INT;
ALTER TABLE departamentos ADD COLUMN loja_id INT;
ALTER TABLE produtos_departamento ADD COLUMN loja_id INT;
ALTER TABLE produtos_mercearia ADD COLUMN loja_id INT;
ALTER TABLE lancamentos ADD COLUMN loja_id INT;

UPDATE produtos_genericos SET loja_id = (SELECT id FROM lojas ORDER BY id LIMIT 1) WHERE loja_id IS NULL;
UPDATE departamentos SET loja_id = (SELECT id FROM lojas ORDER BY id LIMIT 1) WHERE loja_id IS NULL;
UPDATE produtos_departamento SET loja_id = (SELECT id FROM lojas ORDER BY id LIMIT 1) WHERE loja_id IS NULL;
UPDATE produtos_mercearia SET loja_id = (SELECT id FROM lojas ORDER BY id LIMIT 1) WHERE loja_id IS NULL;
UPDATE lancamentos SET loja_id = (SELECT id FROM lojas ORDER BY id LIMIT 1) WHERE loja_id IS NULL;

ALTER TABLE produtos_genericos ALTER COLUMN loja_id SET NOT NULL;
ALTER TABLE departamentos ALTER COLUMN loja_id SET NOT NULL;
ALTER TABLE produtos_departamento ALTER COLUMN loja_id SET NOT NULL;
ALTER TABLE produtos_mercearia ALTER COLUMN loja_id SET NOT NULL;
ALTER TABLE lancamentos ALTER COLUMN loja_id SET NOT NULL;

ALTER TABLE produtos_genericos DROP CONSTRAINT IF EXISTS produtos_genericos_codigo_key;
ALTER TABLE produtos_mercearia DROP CONSTRAINT IF EXISTS uk_produto_mercearia_sku;
ALTER TABLE produtos_mercearia DROP CONSTRAINT IF EXISTS uk_produto_mercearia_codigo_barras;
ALTER TABLE produtos_departamento DROP CONSTRAINT IF EXISTS uk_departamento_codigo;

ALTER TABLE produtos_genericos ADD CONSTRAINT uk_produtos_genericos_loja_codigo UNIQUE (loja_id, codigo);
ALTER TABLE produtos_mercearia ADD CONSTRAINT uk_produto_mercearia_loja_sku UNIQUE (loja_id, sku);
ALTER TABLE produtos_mercearia ADD CONSTRAINT uk_produto_mercearia_loja_codigo_barras UNIQUE (loja_id, codigo_barras);
ALTER TABLE produtos_departamento ADD CONSTRAINT uk_produto_departamento_loja_codigo UNIQUE (loja_id, departamento_id, codigo);

ALTER TABLE produtos_genericos ADD CONSTRAINT fk_produtos_genericos_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE;
ALTER TABLE departamentos ADD CONSTRAINT fk_departamentos_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE;
ALTER TABLE produtos_departamento ADD CONSTRAINT fk_produtos_departamento_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE;
ALTER TABLE produtos_mercearia ADD CONSTRAINT fk_produtos_mercearia_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE;
ALTER TABLE lancamentos ADD CONSTRAINT fk_lancamentos_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE;

CREATE INDEX idx_produtos_genericos_loja ON produtos_genericos(loja_id);
CREATE INDEX idx_departamentos_loja ON departamentos(loja_id);
CREATE INDEX idx_produtos_departamento_loja ON produtos_departamento(loja_id);
CREATE INDEX idx_produtos_mercearia_loja ON produtos_mercearia(loja_id);
CREATE INDEX idx_lancamentos_loja ON lancamentos(loja_id);
