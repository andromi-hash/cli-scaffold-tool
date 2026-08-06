#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("\n  ⚡ TURBO STACK — Full-Stack Scaffolder\n");

  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-app",
      validate: (v) => (v ? true : "Project name is required"),
    },
    {
      type: "select",
      name: "frontend",
      message: "Frontend framework:",
      choices: [
        { title: "React + Vite", value: "react" },
        { title: "Vue + Vite", value: "vue" },
        { title: "Svelte + Vite", value: "svelte" },
        { title: "None (API only)", value: "none" },
      ],
    },
    {
      type: "select",
      name: "backend",
      message: "Backend framework:",
      choices: [
        { title: "Express", value: "express" },
        { title: "Fastify", value: "fastify" },
        { title: "None (frontend only)", value: "none" },
      ],
    },
    {
      type: "select",
      name: "database",
      message: "Database / ORM:",
      choices: [
        { title: "Prisma + SQLite", value: "prisma-sqlite" },
        { title: "Prisma + PostgreSQL", value: "prisma-postgres" },
        { title: "None", value: "none" },
      ],
    },
    {
      type: "confirm",
      name: "auth",
      message: "Include JWT authentication?",
      initial: true,
    },
    {
      type: "confirm",
      name: "docker",
      message: "Include Docker setup?",
      initial: true,
    },
    {
      type: "confirm",
      name: "ci",
      message: "Include GitHub Actions CI?",
      initial: true,
    },
  ]);

  if (!response.projectName) {
    console.log("\n  ✖ Aborted.");
    process.exit(0);
  }

  const target = path.resolve(process.cwd(), response.projectName);
  const hasBackend = response.backend !== "none";
  const hasDb = response.database !== "none";
  const useAuth = response.auth && hasBackend;
  const usePostgres = response.database === "prisma-postgres";

  if (fs.existsSync(target)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `Directory "${response.projectName}" exists. Overwrite?`,
      initial: false,
    });
    if (!overwrite) {
      console.log("\n  ✖ Aborted.");
      process.exit(0);
    }
    fs.rmSync(target, { recursive: true });
  }

  fs.mkdirSync(target, { recursive: true });

  const pkg = {
    name: response.projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {},
    dependencies: {},
    devDependencies: {},
  };

  // ========== FRONTEND ==========
  if (response.frontend === "react") {
    pkg.scripts.dev = "vite";
    pkg.scripts.build = "vite build";
    pkg.scripts.preview = "vite preview";
    pkg.dependencies["react"] = "^18.3.1";
    pkg.dependencies["react-dom"] = "^18.3.1";
    pkg.devDependencies["vite"] = "^5.4.0";
    pkg.devDependencies["@vitejs/plugin-react"] = "^4.3.0";

    fs.writeFileSync(
      path.join(target, "index.html"),
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${response.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
    );

    fs.mkdirSync(path.join(target, "src"), { recursive: true });

    fs.writeFileSync(
      path.join(target, "src/main.jsx"),
      `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
    );

    fs.writeFileSync(
      path.join(target, "src/App.jsx"),
      `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem", fontFamily: "system-ui" }}>
      <h1>${response.projectName}</h1>
      <p>Scaffolded with Turbo Stack</p>
      <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
    </div>
  );
}
`
    );

    fs.writeFileSync(
      path.join(target, "src/index.css"),
      `body { margin: 0; background: #0f0f1a; color: #fff; }
button { padding: 0.5rem 1.5rem; border-radius: 8px; border: none; background: #6366f1; color: #fff; font-size: 1rem; cursor: pointer; }
`
    );

    fs.writeFileSync(
      path.join(target, "vite.config.js"),
      `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
`
    );
  }

  if (response.frontend === "vue") {
    pkg.scripts.dev = "vite";
    pkg.scripts.build = "vite build";
    pkg.scripts.preview = "vite preview";
    pkg.dependencies["vue"] = "^3.4.0";
    pkg.devDependencies["vite"] = "^5.4.0";
    pkg.devDependencies["@vitejs/plugin-vue"] = "^5.1.0";

    fs.writeFileSync(
      path.join(target, "index.html"),
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${response.projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`
    );

    fs.mkdirSync(path.join(target, "src"), { recursive: true });

    fs.writeFileSync(
      path.join(target, "src/main.js"),
      `import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";

createApp(App).mount("#app");
`
    );

    fs.writeFileSync(
      path.join(target, "src/App.vue"),
      `<script setup>
import { ref } from "vue";
const count = ref(0);
</script>

<template>
  <div class="app">
    <h1>${response.projectName}</h1>
    <p>Scaffolded with Turbo Stack</p>
    <button @click="count++">count is {{ count }}</button>
  </div>
</template>

<style scoped>
.app { text-align: center; padding: 4rem 1rem; font-family: system-ui; }
button { padding: 0.5rem 1.5rem; border-radius: 8px; border: none; background: #42b883; color: #fff; font-size: 1rem; cursor: pointer; }
</style>
`
    );

    fs.writeFileSync(
      path.join(target, "src/index.css"),
      `body { margin: 0; background: #0f0f1a; color: #fff; }
`
    );

    fs.writeFileSync(
      path.join(target, "vite.config.js"),
      `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000 },
});
`
    );
  }

  if (response.frontend === "svelte") {
    pkg.scripts.dev = "vite";
    pkg.scripts.build = "vite build";
    pkg.scripts.preview = "vite preview";
    pkg.devDependencies["vite"] = "^5.4.0";
    pkg.devDependencies["@sveltejs/vite-plugin-svelte"] = "^3.1.0";
    pkg.devDependencies["svelte"] = "^4.2.0";

    fs.writeFileSync(
      path.join(target, "index.html"),
      `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${response.projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`
    );

    fs.mkdirSync(path.join(target, "src"), { recursive: true });

    fs.writeFileSync(
      path.join(target, "src/main.js"),
      `import App from "./App.svelte";
import "./index.css";

const app = new App({ target: document.getElementById("app") });
export default app;
`
    );

    fs.writeFileSync(
      path.join(target, "src/App.svelte"),
      `<script>
  let count = 0;
</script>

<main>
  <h1>${response.projectName}</h1>
  <p>Scaffolded with Turbo Stack</p>
  <button on:click={() => count += 1}>count is {count}</button>
</main>

<style>
  main { text-align: center; padding: 4rem 1rem; font-family: system-ui; }
  button { padding: 0.5rem 1.5rem; border-radius: 8px; border: none; background: #ff3e00; color: #fff; font-size: 1rem; cursor: pointer; }
</style>
`
    );

    fs.writeFileSync(
      path.join(target, "src/index.css"),
      `body { margin: 0; background: #0f0f1a; color: #fff; }
`
    );

    fs.writeFileSync(
      path.join(target, "vite.config.js"),
      `import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: { port: 3000 },
});
`
    );
  }

  // ========== DATABASE ==========
  if (hasDb) {
    pkg.devDependencies["prisma"] = "^5.16.0";
    pkg.dependencies["@prisma/client"] = "^5.16.0";

    fs.mkdirSync(path.join(target, "prisma"), { recursive: true });

    const passwordField = useAuth ? "  password  String\n" : "";
    const dbUrlLine = usePostgres
      ? '  url      = env("DATABASE_URL")'
      : '  url      = env("DATABASE_URL")';

    fs.writeFileSync(
      path.join(target, "prisma/schema.prisma"),
      `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${usePostgres ? "postgresql" : "sqlite"}"
${dbUrlLine}
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
${passwordField}  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`
    );

    const seedCreate = useAuth
      ? `{ email: "dev@example.com", name: "Developer", password: "$2a$10$placeholder" }`
      : `{ email: "dev@example.com", name: "Developer" }`;

    fs.writeFileSync(
      path.join(target, "prisma/seed.js"),
      `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: ${seedCreate},
  });
  console.log("Seeded:", user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
`
    );

    pkg.scripts["db:push"] = "npx prisma db push";
    pkg.scripts["db:seed"] = "node prisma/seed.js";
    pkg.scripts["db:studio"] = "npx prisma studio";
  }

  // ========== AUTH FILES ==========
  if (useAuth) {
    pkg.dependencies["jsonwebtoken"] = "^9.0.0";
    pkg.dependencies["bcryptjs"] = "^2.4.3";

    fs.mkdirSync(path.join(target, "server/middleware"), { recursive: true });
    fs.mkdirSync(path.join(target, "server/routes"), { recursive: true });

    // Shared JWT helpers (framework-agnostic core + Express middleware)
    fs.writeFileSync(
      path.join(target, "server/middleware/auth.js"),
      `import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Express middleware */
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/** Fastify preHandler hook */
export async function authenticateFastify(request, reply) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return reply.code(401).send({ error: "No token provided" });
  }
  try {
    request.user = verifyToken(header.slice(7));
  } catch {
    return reply.code(401).send({ error: "Invalid token" });
  }
}
`
    );

    if (response.backend === "express") {
      const authStore = hasDb
        ? `import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser({ email, password, name }) {
  return prisma.user.create({
    data: { email, password, name },
    select: { id: true, email: true, name: true },
  });
}`
        : `// In-memory store (select Prisma for persistent users)
const users = [];

async function findUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

async function createUser({ email, password, name }) {
  const user = { id: users.length + 1, email, password, name: name || null };
  users.push(user);
  return { id: user.id, email: user.email, name: user.name };
}`;

      fs.writeFileSync(
        path.join(target, "server/routes/auth.js"),
        `import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth.js";

${authStore}

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (await findUserByEmail(email)) {
      return res.status(409).json({ error: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ email, password: hashed, name });
    const token = generateToken({ id: user.id, email: user.email });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name || null } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
`
      );
    }

    if (response.backend === "fastify") {
      const authStore = hasDb
        ? `import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser({ email, password, name }) {
  return prisma.user.create({
    data: { email, password, name },
    select: { id: true, email: true, name: true },
  });
}`
        : `const users = [];

async function findUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

async function createUser({ email, password, name }) {
  const user = { id: users.length + 1, email, password, name: name || null };
  users.push(user);
  return { id: user.id, email: user.email, name: user.name };
}`;

      fs.writeFileSync(
        path.join(target, "server/routes/auth.js"),
        `import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth.js";

${authStore}

export async function authRoutes(app) {
  app.post("/api/auth/signup", async (request, reply) => {
    try {
      const { email, password, name } = request.body || {};
      if (!email || !password) {
        return reply.code(400).send({ error: "Email and password required" });
      }
      if (await findUserByEmail(email)) {
        return reply.code(409).send({ error: "User already exists" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await createUser({ email, password: hashed, name });
      const token = generateToken({ id: user.id, email: user.email });
      return reply.code(201).send({ token, user });
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body || {};
      const user = await findUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }
      const token = generateToken({ id: user.id, email: user.email });
      return { token, user: { id: user.id, email: user.email, name: user.name || null } };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });
}
`
      );
    }
  }

  // ========== BACKEND SERVER (with auth mounted) ==========
  if (response.backend === "express") {
    pkg.dependencies["express"] = "^4.19.0";
    pkg.dependencies["cors"] = "^2.8.5";
    pkg.dependencies["morgan"] = "^1.10.0";
    pkg.scripts["dev:server"] = "node server/index.js";

    fs.mkdirSync(path.join(target, "server"), { recursive: true });

    const authImport = useAuth
      ? `import authRouter from "./routes/auth.js";\n`
      : "";
    const authMount = useAuth ? `app.use("/api/auth", authRouter);\n` : "";

    fs.writeFileSync(
      path.join(target, "server/index.js"),
      `import express from "express";
import cors from "cors";
import morgan from "morgan";
${authImport}
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

${authMount}
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`
    );
  }

  if (response.backend === "fastify") {
    pkg.dependencies["fastify"] = "^4.28.0";
    pkg.dependencies["@fastify/cors"] = "^9.0.0";
    pkg.scripts["dev:server"] = "node server/index.js";

    fs.mkdirSync(path.join(target, "server"), { recursive: true });

    const authImport = useAuth
      ? `import { authRoutes } from "./routes/auth.js";\n`
      : "";
    const authRegister = useAuth ? `await authRoutes(app);\n` : "";

    fs.writeFileSync(
      path.join(target, "server/index.js"),
      `import Fastify from "fastify";
import cors from "@fastify/cors";
${authImport}
const app = Fastify({ logger: true });

await app.register(cors);

app.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

${authRegister}
const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 4000, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
`
    );
  }

  // ========== DOCKER ==========
  if (response.docker) {
    const cmd = hasBackend
      ? '["npm", "run", "dev:server"]'
      : '["npm", "run", "dev"]';

    fs.writeFileSync(
      path.join(target, "Dockerfile"),
      `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ${cmd}
`
    );

    let compose = `services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - JWT_SECRET=change-me-in-production
`;

    if (usePostgres) {
      compose += `      - DATABASE_URL=postgresql://app:secret@db:5432/${response.projectName}
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: ${response.projectName}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`;
    } else {
      compose += `    volumes:
      - .:/app
      - /app/node_modules
`;
    }

    fs.writeFileSync(path.join(target, "docker-compose.yml"), compose);
  }

  // ========== CI ==========
  if (response.ci) {
    fs.mkdirSync(path.join(target, ".github/workflows"), { recursive: true });
    fs.writeFileSync(
      path.join(target, ".github/workflows/ci.yml"),
      `name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build --if-present
`
    );
  }

  // ========== package.json / env / gitignore ==========
  fs.writeFileSync(
    path.join(target, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n"
  );

  let envContent = `NODE_ENV=development
PORT=4000
JWT_SECRET=change-me-to-a-random-string
`;
  if (hasDb) {
    envContent += usePostgres
      ? `DATABASE_URL=postgresql://app:secret@localhost:5432/${response.projectName}\n`
      : `DATABASE_URL=file:./dev.db\n`;
  }
  fs.writeFileSync(path.join(target, ".env"), envContent);
  fs.writeFileSync(path.join(target, ".env.example"), envContent);

  fs.writeFileSync(
    path.join(target, ".gitignore"),
    `node_modules/
dist/
.env
*.db
`
  );

  // ========== DONE ==========
  console.log(`\n  ✓ Scaffolded "${response.projectName}" at ${target}\n`);
  console.log("  Next steps:");
  console.log(`    cd ${response.projectName}`);
  console.log("    npm install");
  if (hasDb) console.log("    npx prisma db push");
  if (response.frontend !== "none") console.log("    npm run dev         # Start frontend");
  if (hasBackend) console.log("    npm run dev:server  # Start backend");
  if (useAuth) {
    console.log("\n  Auth endpoints:");
    console.log("    POST /api/auth/signup  { email, password, name? }");
    console.log("    POST /api/auth/login   { email, password }");
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
