CREATE TABLE produtos_departamento(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    departamento_id INT NOT NULL,
    nome VARCHAR(120) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,

    CONSTRAINT fk_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamentos(id)
);