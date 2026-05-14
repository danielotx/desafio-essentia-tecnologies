# Desafio Full Stack — Essentia Group

Aplicação web de gerenciamento de tarefas (to-do list) para a empresa fictícia **TechX**, entregue como solução do desafio técnico da vaga de Desenvolvedor(a) Full Stack na Essentia Group.

> Enunciado oficial: `Teste Fullstack Tech - Essentia Group.pdf` (na raiz).

## Funcionalidades

- Cadastro e login de usuários com **JWT**.
- CRUD completo de tarefas, isolado por usuário (uma tarefa só é visível/editável por quem a criou).
- Cada tarefa pode ter metadados ricos: **tags**, **prioridade** (baixa/média/alta), **vencimento**, **anexos** e **notas**.
- Marcação de tarefas como concluídas/pendentes.
- Listagem ordenada por status (pendentes primeiro) e data.

## Stack

| Camada            | Tecnologia                                                          |
| ----------------- | ------------------------------------------------------------------- |
| Frontend          | Angular 21 (standalone, Reactive Forms, Signals, lazy routes)       |
| Backend           | Node.js 20+ • TypeScript estrito • Express                          |
| Banco principal   | MySQL 8 via **Prisma**                                              |
| Banco secundário  | MongoDB 7 via **Mongoose** (metadados das tarefas)                  |
| Autenticação      | JWT (`jsonwebtoken`) + hash bcrypt (`bcryptjs`)                     |
| Validação         | `zod` no backend, Reactive Forms + validators no frontend           |
| Infra local       | Docker Compose (MySQL + MongoDB)                                    |
| Lint/format       | ESLint + Prettier (backend) • Angular ESLint + Prettier (frontend)  |

## Estrutura do repositório

```
.
├── backend/                                    # API REST (Node + TypeScript)
│   ├── prisma/                                 # schema.prisma + migrations
│   └── src/
│       ├── app.ts / server.ts                  # Express + bootstrap
│       ├── config/                             # env, logger, prisma, mongo
│       ├── controllers/ / services/ / routes/  # camadas da API
│       ├── middlewares/                        # error handler, authenticate
│       ├── models/                             # schema Mongoose (TaskMetadata)
│       ├── schemas/                            # validação zod
│       ├── lib/                                # JWT helpers
│       └── types/                              # type augments do Express
├── frontend/                                   # SPA Angular
│   └── src/app/
│       ├── core/                               # services, interceptors, guards, models
│       └── features/
│           ├── auth/                           # login + register
│           └── tasks/                          # listagem, card, form
├── docker-compose.yml                          # MySQL + MongoDB
└── README.md
```

## Pré-requisitos

- [Docker Desktop](https://docs.docker.com/get-docker/) com integração WSL habilitada (se estiver no Windows).
- **Node.js 20+** e **npm 10+**.
- (Opcional) [Prisma Studio](https://www.prisma.io/studio) para inspecionar o MySQL via GUI.

## Como rodar do zero

### 1. Subir os bancos (MySQL + MongoDB)

```bash
docker compose up -d
```

| Serviço   | Porta | Credenciais (dev)                                            | Banco            |
| --------- | ----- | ------------------------------------------------------------ | ---------------- |
| `mysql`   | 3306  | root / `rootpass` • usuário `techx` / `techxpass`            | `techx_tasks`    |
| `mongodb` | 27017 | root `mongo` / `mongopass` (authSource: `admin`)             | `techx_metadata` |

> ⚠️ Credenciais **somente para desenvolvimento local**. Não use em produção.

Verificar:

```bash
docker compose ps                  # ambos devem estar (healthy)
docker compose logs -f mysql       # acompanhar logs
docker compose down                # parar (preserva dados nos volumes)
docker compose down -v             # parar e apagar tudo
```

### 2. Backend

```bash
cd backend
cp .env.example .env               # ajustar se necessário
npm install
npx prisma migrate dev             # aplica as migrations no MySQL
npm run dev                        # http://localhost:3000
```

Outros scripts disponíveis:

```bash
npm run build       # compila TypeScript para dist/
npm start           # roda o build de produção
npm run lint        # ESLint
npm run format      # Prettier
npx prisma studio   # GUI do banco em http://localhost:5555
```

### 3. Frontend

```bash
cd frontend
npm install
npm start           # http://localhost:4200 (proxy /api → :3000)
```

Outros scripts:

```bash
npm run build       # build de produção em dist/frontend
npm run lint        # Angular ESLint
```

## Variáveis de ambiente (`backend/.env`)

Veja `backend/.env.example`. Resumo:

| Variável         | Descrição                                                     |
| ---------------- | ------------------------------------------------------------- |
| `PORT`           | Porta do servidor HTTP (padrão `3000`)                        |
| `NODE_ENV`       | `development` / `test` / `production`                         |
| `LOG_LEVEL`      | Nível do Pino (`info`, `debug`, ...)                          |
| `CORS_ORIGIN`    | Origin permitido pelo CORS (default: `http://localhost:4200`) |
| `DATABASE_URL`   | URL MySQL (Prisma)                                            |
| `MONGODB_URI`    | URI MongoDB (Mongoose)                                        |
| `JWT_SECRET`     | Segredo do JWT (mínimo 16 caracteres, **obrigatório**)        |
| `JWT_EXPIRES_IN` | Expiração do token (default: `1d`)                            |

> O Prisma Migrate cria uma **shadow database** para detectar drift de schema; por isso o `DATABASE_URL` de dev usa `root`. Em produção, configure `shadowDatabaseUrl` ou rode migrations com credenciais administrativas separadas das de runtime.

## Endpoints da API

Base path: `http://localhost:3000/api`

### Públicos

| Método | Path             | Descrição                                              |
| ------ | ---------------- | ------------------------------------------------------ |
| `GET`  | `/health`        | Status do servidor.                                    |
| `GET`  | `/health/db`     | Status do MySQL e do MongoDB.                          |
| `POST` | `/auth/register` | Cria usuário. Body: `{ email, password, name? }`.      |
| `POST` | `/auth/login`    | Autentica. Retorna `{ user, token }`.                  |

### Protegidos (header `Authorization: Bearer <token>`)

| Método   | Path                   | Descrição                                          |
| -------- | ---------------------- | -------------------------------------------------- |
| `GET`    | `/me`                  | Dados do usuário autenticado.                      |
| `GET`    | `/tasks`               | Lista tarefas do usuário (com metadados).          |
| `POST`   | `/tasks`               | Cria tarefa.                                       |
| `PUT`    | `/tasks/:id`           | Atualiza tarefa (e/ou metadados).                  |
| `PATCH`  | `/tasks/:id/toggle`    | Alterna `completed`.                               |
| `DELETE` | `/tasks/:id`           | Remove tarefa + metadados.                         |

#### Exemplo de payload de tarefa

```jsonc
// POST /api/tasks
{
  "title": "Preparar entrega",           // obrigatório
  "description": "Finalizar o desafio",  // opcional, vai pro MySQL
  "tags": ["urgente", "desafio"],        // opcional, vai pro MongoDB
  "priority": "high",                    // low | medium | high
  "dueDate": "2026-05-20T18:00:00Z",     // ISO 8601
  "attachments": [
    { "name": "PDF", "url": "https://example.com/desafio.pdf" }
  ],
  "notes": "Revisar antes de enviar"
}
```

#### Códigos de status

| Código | Quando                                                              |
| ------ | ------------------------------------------------------------------- |
| `200`  | Sucesso em GET/PUT/PATCH.                                           |
| `201`  | Criado (POST /auth/register e POST /tasks).                         |
| `204`  | Removido (DELETE /tasks/:id).                                       |
| `400`  | Validação zod falhou; corpo retorna `details` + `formErrors`.       |
| `401`  | Token ausente, inválido, expirado, ou credenciais erradas no login. |
| `404`  | Tarefa não pertence ao usuário ou não existe.                       |
| `409`  | Email já cadastrado no registro.                                    |
| `500`  | Erro inesperado (sem vazamento de detalhes internos).               |

## Fluxo de autenticação

1. `POST /api/auth/register` cria o usuário (senha em bcrypt, 10 rounds).
2. `POST /api/auth/login` retorna `{ user, token }`. O frontend armazena o token em `localStorage` (`techx.token`).
3. Toda requisição autenticada inclui `Authorization: Bearer <token>` — anexado automaticamente pelo `authInterceptor` no Angular.
4. O middleware `authenticate` do backend valida o token, busca o usuário no banco (sem cache, garante consistência) e injeta `req.user`.
5. Em qualquer 401 retornado pela API, o interceptor limpa o token e redireciona para `/login`.
6. O token expira em **1 dia** (configurável via `JWT_EXPIRES_IN`).

## Branch de entrega

Branch única **`desafio-essentia-tecnologies`** com commits incrementais (cada bloco funcional do roadmap é um commit ou grupo coeso).

## Troubleshooting

**Prisma falha com "shadow database"**
→ Use o usuário `root` no `DATABASE_URL` em dev, ou configure `shadowDatabaseUrl`.

**Erro `ECONNREFUSED` ao subir o backend**
→ Confirme que `docker compose ps` mostra os dois serviços (`healthy`).

**Frontend faz request direto pro `:4200` sem proxy**
→ Use `npm start` (e não `ng build && servir o dist`); o proxy só atua no `ng serve`.

**`docker: command not found` no WSL**
→ Habilite a integração do Docker Desktop com este distro WSL: Settings → Resources → WSL Integration.

---

Desenvolvido por [@danielotx](https://github.com/danielotx) como parte do processo seletivo da Essentia Group.
