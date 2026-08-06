# create-turbo-stack

Scaffold a production-ready full-stack app in ~30 seconds.

## Features
- Frontend: **React**, **Vue**, or **Svelte** (Vite)
- Backend: **Express** or **Fastify**
- Database: Prisma + SQLite (swap to Postgres)
- JWT auth (signup/login)
- Docker + docker-compose
- GitHub Actions CI
- Interactive prompts (or flags)

## Usage

```bash
# from this package
node bin/create-turbo-stack.js my-app

# or after npm link
npm link
create-turbo-stack my-app
```

### Flags (non-interactive)
```bash
node bin/create-turbo-stack.js my-app \
  --frontend react \
  --backend express \
  --db sqlite \
  --yes
```

Then:
```bash
cd my-app
cp .env.example .env
npm install
npm run db:push
npm run dev
```

## License
MIT

## Aspen Grove
Standalone product package (**MIT**). Meta mesh: [aspen-grove](https://github.com/AbsolutionAI/aspen-grove).  
Third-party: `THIRD_PARTY.md`. Run `make smoke`.
