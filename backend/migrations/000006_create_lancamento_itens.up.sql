CREATE TABLE lancamentos_itens (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    lancamento_id INT NOT NULL,

    produto_mercearia_id INT,

    produto_departamento_id INT,

    quantidade NUMERIC(10,4) NOT NULL,

    CONSTRAINT fk_lancamento_item_lancamento
        FOREIGN KEY (lancamento_id)
        REFERENCES lancamentos(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_lancamento_item_mercearia
        FOREIGN KEY (produto_mercearia_id)
        REFERENCES produtos_mercearia(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_lancamento_item_departamento
        FOREIGN KEY (produto_departamento_id)
        REFERENCES produtos_departamento(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_lancamento_item_quantidade
        CHECK (quantidade > 0)
    
    CONSTRAINT ck_lancamento_item_produto
        CHECK(
            produto_mercearia_id IS NOT NULL
            OR
            produto_departamento_id IS NOT NULL
        )
);