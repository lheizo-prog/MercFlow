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
- Transferências entre departamentos
- Registro de quebras
- Conversão automática de unidades e embalagens
- Dashboard de lançamentos com filtros, ranking, gráficos e comparação
- Autenticação de usuários com JWT e senhas protegidas por bcrypt
- Perfis de acesso: `operador`, `visualizador`, `admin` e `super_admin`
- Cadastro de usuários e definição de permissões
- Multi-loja com isolamento dos dados por `loja_id`
- Navegação entre lojas para administradores
- Comparação de duas lojas em intervalos independentes no dashboard
- Sistema de migrations em SQL
- API REST em Go
- Interface Web em React + TypeScript

## Em desenvolvimento

- Relatórios
- Controle de Estoque
- Auditoria de operações

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

As migrations são executadas com `golang-migrate`. A migration `000010_add_loja_scope` adiciona o isolamento por loja às tabelas de produtos, departamentos e lançamentos.

O banco remoto deve ser PostgreSQL e a URL deve estar disponível na variável `DATABASE_URL`.

---

# Executando as migrations

Na pasta `backend`, para um banco novo:

```bash
migrate -path migrations -database "${DATABASE_URL}" up
```

No PowerShell:

```powershell
$env:DATABASE_URL="postgresql://usuario:senha@host:5432/banco?sslmode=require"
migrate -path migrations -database $env:DATABASE_URL up
```

O comando aplica somente as migrations pendentes. Para conferir a versão:

```bash
migrate -path migrations -database "${DATABASE_URL}" version
```

Em um banco existente, faça backup antes de aplicar migrations que alteram tabelas:

```bash
pg_dump "${DATABASE_URL}" > backup.sql
```

Depois das migrations, o backend cria ou atualiza o administrador padrão ao iniciar. As credenciais padrão são:

```text
Usuário: admin
Senha: admin123
```

Em produção, configure credenciais próprias com `ADMIN_USERNAME` e `ADMIN_PASSWORD`.

## Recriar um banco de desenvolvimento

O comando abaixo apaga todos os dados do schema `public`. Use somente em ambiente de desenvolvimento ou após um backup:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

---

# Executando a API

Na pasta `backend`:

```bash
go run cmd/api/main.go
```

Variáveis necessárias:

```text
DATABASE_URL=postgresql://...
JWT_SECRET=uma-chave-secreta-forte
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

O `JWT_SECRET` deve ser longo e exclusivo em produção. Nunca versionar o arquivo `.env`.

---

# Executando o Frontend

```bash
npm install

npm run dev
```

Para apontar o frontend para uma API remota, configure:

```text
VITE_API_URL=https://seu-backend.exemplo.com
```

## Perfis e lojas

- `operador`: dashboard e criação/leitura de lançamentos conforme suas permissões.
- `visualizador`: acesso de leitura ao dashboard e aos lançamentos.
- `admin`: pode navegar entre lojas e comparar lojas quando autorizado.
- `super_admin`: acesso global às lojas e bypass das permissões de recurso.

Usuários comuns recebem apenas os dados da loja associada à sua conta. Administradores podem selecionar uma loja na navbar. No dashboard, o intervalo da Loja 1 e o intervalo da Loja 2 são consultados separadamente.

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

## Sprint 8

- Produto Mercearia
- Pesquisa por SKU
- Cadastro de Embalagens
- Integração com Produto Genérico

## Próximas Sprints

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
