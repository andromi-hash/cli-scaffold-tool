# create-turbo-stack — Full-Stack Scaffolder

**Scaffold a production-ready full-stack app in seconds.**

Choose your frontend (React, Vue, Svelte or none), backend (Express or Fastify), database (Prisma + SQLite/Postgres), and get JWT auth, Docker, and CI pre-configured.

## Usage

```bash
npx create-turbo-stack
```

Or from this repo:

```bash
node cli.js
```

## What you get

Interactive prompts configure:

| Option | Choices |
|--------|---------|
| **Frontend** | React + Vite, Vue + Vite, Svelte + Vite, or none |
| **Backend** | Express or Fastify (health endpoint + optional auth) |
| **Database** | Prisma + SQLite, Prisma + PostgreSQL, or none |
| **Auth** | JWT signup/login with bcrypt (mounted on the server) |
| **Docker** | Dockerfile + docker-compose (Postgres service when selected) |
| **CI** | GitHub Actions workflow |

### Auth endpoints (when enabled)

```
POST /api/auth/signup   { email, password, name? }
POST /api/auth/login    { email, password }
```

- With Prisma selected → users are stored in the database
- Without Prisma → in-memory store (fine for demos)

### Generated project quick start

```bash
cd my-app
npm install
npx prisma db push   # if you selected a database
npm run dev          # frontend
npm run dev:server   # backend
```

## License

MIT
