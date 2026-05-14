# Desafio Full Stack — Essentia Group

Aplicação web de gerenciamento de tarefas (to-do list) para a empresa fictícia **TechX**, desenvolvida como entrega do desafio técnico da vaga de Desenvolvedor(a) Full Stack na Essentia Group.

## Stack

- **Frontend:** Angular (Reactive Forms, HttpClient, standalone components)
- **Backend:** Node.js + TypeScript + Express
- **Banco principal:** MySQL (via Prisma)
- **Banco secundário:** MongoDB (via Mongoose) — metadados adicionais das tarefas
- **Autenticação:** JWT
- **Infra local:** Docker Compose

## Estrutura do repositório

```
.
├── backend/                                    # API REST (Node + TS)
├── frontend/                                   # SPA (Angular)
├── docker-compose.yml                          # MySQL + MongoDB para desenvolvimento
└── Teste Fullstack Tech - Essentia Group.pdf   # Enunciado oficial
```

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose v2
- Node.js 20+ (será necessário para backend e frontend nas próximas fases)

## Subindo a infraestrutura local (MySQL + MongoDB)

Os bancos de dados rodam em contêineres Docker. Para subi-los:

```bash
docker compose up -d
```

Isso inicia dois serviços:

| Serviço   | Porta | Credenciais (dev)                                | Banco            |
| --------- | ----- | ------------------------------------------------ | ---------------- |
| `mysql`   | 3306  | usuário `techx` / senha `techxpass` (root: `rootpass`) | `techx_tasks`    |
| `mongodb` | 27017 | usuário `mongo` / senha `mongopass`              | `techx_metadata` |

> ⚠️ As credenciais acima são **somente para desenvolvimento local**. Em produção, use segredos via variáveis de ambiente.

Verificar o status:

```bash
docker compose ps
```

Acompanhar logs:

```bash
docker compose logs -f mysql
docker compose logs -f mongodb
```

Parar os serviços (preservando os dados nos volumes):

```bash
docker compose down
```

Parar e remover todos os dados:

```bash
docker compose down -v
```

## Status

Em desenvolvimento. As instruções de execução do backend e frontend serão adicionadas conforme as fases do projeto forem concluídas.

## Enunciado

O documento `Teste Fullstack Tech - Essentia Group.pdf` (na raiz) contém a descrição oficial do desafio e é a fonte de verdade dos requisitos.
