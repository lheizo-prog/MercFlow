# MercFlow

Sistema de gestão de transferências internas, perdas e controle de produtos para supermercados.

## Objetivo

O MercFlow nasceu com o objetivo de substituir controles realizados em planilhas por um sistema centralizado, padronizado e escalável, permitindo o gerenciamento de produtos, departamentos, transferências e quebras de forma simples e confiável.

O projeto está sendo desenvolvido utilizando uma arquitetura em camadas, priorizando organização, baixo acoplamento e facilidade de manutenção.

---

# Funcionalidades

## Implementadas

- Cadastro de Produtos Genéricos
- Cadastro de Departamentos
- Cadastro de Produtos por Departamento
- Cadastro de Produtos de Mercearia
- Sistema de migrations em SQL
- API REST em Go
- Interface Web em React + TypeScript

## Em desenvolvimento

- Transferências entre departamentos
- Controle de Quebras
- Conversão automática de embalagens
- Dashboard gerencial
- Relatórios
- Controle de Estoque

---

# Tecnologias

## Backend

- Go
- Gin
- PostgreSQL
- pgx/v5

## Frontend

- React
- TypeScript
- Bootstrap

## Infraestrutura

- Docker
- Docker Compose
- SQL (Migrations)

---

# Arquitetura

O projeto segue uma arquitetura em camadas:

```
Frontend
    │
    ▼
Handlers
    │
    ▼
Services
    │
    ▼
Repositories
    │
    ▼
PostgreSQL
```

Cada camada possui apenas uma responsabilidade.

- **Handler:** recebe e responde às requisições HTTP.
- **Service:** contém as regras de negócio.
- **Repository:** realiza acesso ao banco de dados.
- **Model:** representa as entidades do sistema.

---

# Modelagem do domínio

O sistema utiliza quatro entidades principais para representar os produtos.

```
                 Produto Genérico
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
 Produto Departamento          Produto Mercearia
```

## Produto Genérico

Representa o conceito do produto.

Exemplos:

- Manteiga
- Óleo
- Açúcar
- Farinha

Não possui informações específicas de departamentos ou embalagens.

---

## Produto Departamento

Representa como determinado departamento utiliza o produto.

Exemplo:

Produto Genérico:

```
Manteiga
```

Departamento:

```
Padaria
```

Produto Departamento:

```
MP Manteiga
```

Contém informações como:

- nome
- código
- unidade de medida
- fator de conversão
- departamento

---

## Produto Mercearia

Representa a embalagem comercial disponível para compra ou transferência.

Exemplos:

- Óleo 900 ml
- Óleo 500 ml
- Manteiga 200 g

Contém informações como:

- SKU
- Marca
- Descrição
- Código de Barras
- Quantidade da Embalagem
- Unidade de Medida

A relação entre Produto Mercearia e Produto Departamento acontece **indiretamente**, através do Produto Genérico, preservando a independência entre as entidades.

---

# Estrutura do projeto

```
backend/
│
├── cmd/
│   ├── api/
│   └── migrate/
│
├── internal/
│   ├── config/
│   ├── database/
│   ├── handlers/
│   ├── models/
│   ├── repository/
│   ├── routes/
│   └── service/
│
├── migrations/
│
└── README.md
```

---

# Banco de Dados

O banco de dados é gerenciado através de migrations escritas em SQL puro.

Cada migration possui dois arquivos:

```
000001_create_produtos.up.sql
000001_create_produtos.down.sql
```

As migrations são executadas através do runner próprio do projeto.

---

# Executando as migrations

Na pasta `backend`:

```bash
go run cmd/migrate/main.go
```

---

# Executando a API

Na pasta `backend`:

```bash
go run cmd/api/main.go
```

---

# Executando o Frontend

```bash
npm install

npm run dev
```

---

# Roadmap

## Sprint 1

- Produto Genérico

## Sprint 2

- Departamento

## Sprint 3

- Produto Departamento

## Sprint 4

- Refatorações

## Sprint 5

- Melhorias de arquitetura

## Sprint 6

- Organização do Backend

## Sprint 7

- Sistema de Migrations

## Sprint 8 (Atual)

- Produto Mercearia
- Pesquisa por SKU
- Cadastro de Embalagens
- Integração com Produto Genérico

## Próximas Sprints

- Transferências
- Conversão automática de embalagens
- Controle de Quebras
- Dashboard
- Relatórios
- Controle de Estoque
- Auditoria

---

# Filosofia do projeto

O MercFlow foi projetado seguindo alguns princípios:

- Separação clara de responsabilidades.
- Baixo acoplamento entre entidades.
- Facilidade de manutenção.
- Escalabilidade.
- Regras de negócio centralizadas na camada de Service.
- Persistência desacoplada através de Repositories.
- Evolução incremental por Sprints.

O objetivo é construir um sistema robusto, extensível e preparado para crescer sem comprometer sua arquitetura.
