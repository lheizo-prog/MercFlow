CREATE TABLE produtos_departamento(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    produto_generico_id INT NOT NULL,
    departamento_id INT NOT NULL,
    nome VARCHAR(120) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    fator_conversao NUMERIC(10,4) NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_produto_departamento_produto
        FOREIGN KEY (produto_generico_id)
        REFERENCES produtos_genericos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_produto_departamento_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamentos(id)
        ON DELETE RESTRICT,

    CONSTRAINT uk_departamento_codigo
        UNIQUE (departamento_id, codigo),

    CONSTRAINT uk_produto_departamento
        UNIQUE (produto_generico_id, departamento_id)
);