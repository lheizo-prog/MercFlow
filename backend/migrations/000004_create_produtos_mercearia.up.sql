CREATE TABLE produtos_mercearia (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    produto_generico_id int NOT NULL,
    sku VARCHAR(30) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    descricao VARCHAR(150) NOT NULL,
    codigo_barras VARCHAR(50) NOT NULL,
    quantidade_embalagem NUMERIC(10,4) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_produto_mercearia_departamento
        FOREIGN KEY (produto_generico_id)
        REFERENCES produtos_genericos(id)
        ON DELETE RESTRICT,

    CONSTRAINT uk_produto_mercearia_sku
        UNIQUE(sku),
    
    CONSTRAINT uk_produto_mercearia_codigo_barras
        UNIQUE(codigo_barras)
)