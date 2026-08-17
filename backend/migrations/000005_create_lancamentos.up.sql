CREATE TABLE lancamentos(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    tipo VARCHAR(20) NOT NULL,

    departamento_id INT NOT NULL,
    
    data_lancamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    observacao VARCHAR(255),

    CONSTRAINT ck_lancamento_tipo
        CHECK (tipo IN ('TRANSFERENCIA', 'QUEBRA')),
    
    CONSTRAINT fk_lancamento_departamento
        FOREIGN KEY(departamento_id)
        REFERENCES departamentos(id)
        ON DELETE RESTRICT
)