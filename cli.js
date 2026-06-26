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

  const target = path.resolve(process.cwd(), response.projectName);

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

  // ---- Frontend setup ----
  if (response.frontend === "react") {
    pkg.scripts.dev = "vite";
    pkg.scripts.build = "vite build";
    pkg.scripts.preview = "vite preview";
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

  // ---- Backend setup ----
  let hasBackend = false;
  if (response.backend === "express") {
    hasBackend = true;
    pkg.dependencies["express"] = "^4.19.0";
    pkg.dependencies["cors"] = "^2.8.5";
    pkg.dependencies["morgan"] = "^1.10.0";

    fs.mkdirSync(path.join(target, "server"), { recursive: true });

    fs.writeFileSync(
      path.join(target, "server/index.js"),
      `import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`
    );

    pkg.scripts["dev:server"] = "node server/index.js";
  }

  if (response.backend === "fastify") {
    hasBackend = true;
    pkg.dependencies["fastify"] = "^4.28.0";
    pkg.dependencies["@fastify/cors"] = "^9.0.0";

    fs.mkdirSync(path.join(target, "server"), { recursive: true });

    fs.writeFileSync(
      path.join(target, "server/index.js"),
      `import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });

await app.register(cors);

app.get("/api/health", async (req, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 4000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
`
    );

    pkg.scripts["dev:server"] = "node server/index.js";
  }

  // ---- Database setup ----
  if (response.database !== "none") {
    pkg.devDependencies["prisma"] = "^5.16.0";
    pkg.dependencies["@prisma/client"] = "^5.16.0";

    const usePostgres = response.database === "prisma-postgres";
    fs.mkdirSync(path.join(target, "prisma"), { recursive: true });

    fs.writeFileSync(
      path.join(target, "prisma/schema.prisma"),
      `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${usePostgres ? "postgresql" : "sqlite"}"
  url      = "${usePostgres ? env("DATABASE_URL") : "file:./dev.db"}"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`
    );

    fs.writeFileSync(
      path.join(target, "prisma/seed.js"),
      `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: { email: "dev@example.com", name: "Developer" },
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

  // ---- Auth setup ----
  if (response.auth && hasBackend) {
    pkg.dependencies["jsonwebtoken"] = "^9.0.0";
    pkg.dependencies["bcryptjs"] = "^2.4.3";

    fs.mkdirSync(path.join(target, "server/middleware"), { recursive: true });

    fs.writeFileSync(
      path.join(target, "server/middleware/auth.js"),
      `import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
`
    );

    fs.writeFileSync(
      path.join(target, "server/routes/auth.js"),
      `import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth.js";

const router = Router();

// In-memory user store (replace with DB in production)
const users = [];

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "User exists" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, email, password: hashed };
  users.push(user);
  const token = generateToken({ id: user.id, email });
  res.status(201).json({ token, user: { id: user.id, email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = generateToken({ id: user.id, email });
  res.json({ token, user: { id: user.id, email } });
});

export default router;
`
    );
  }

  // ---- Docker setup ----
  if (response.docker) {
    fs.writeFileSync(
      path.join(target, "Dockerfile"),
      `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev:server"]
`
    );

    fs.writeFileSync(
      path.join(target, "docker-compose.yml"),
      `services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
`
    );

    if (response.database === "prisma-postgres") {
      const dc = fs.readFileSync(path.join(target, "docker-compose.yml"), "utf-8");
      fs.writeFileSync(
        path.join(target, "docker-compose.yml"),
        dc.replace(
          "services:",
          `services:
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

`
        ).replace(
          "environment:",
          "environment:\n      - DATABASE_URL=postgresql://app:secret@db:5432/${response.projectName}"
        )
      );
      fs.writeFileSync(
        path.join(target, "docker-compose.yml"),
        fs.readFileSync(path.join(target, "docker-compose.yml"), "utf-8") +

`
volumes:
  pgdata:
`
      );
    }
  }

  // ---- CI setup ----
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

  // ---- Write package.json ----
  fs.writeFileSync(
    path.join(target, "package.json"),
    JSON.stringify(pkg, null, 2)
  );

  // ---- Write .env & .gitignore ----
  fs.writeFileSync(
    path.join(target, ".env"),
    `NODE_ENV=development
PORT=4000
JWT_SECRET=change-me-to-a-random-string
${response.database === "prisma-postgres" ? 'DATABASE_URL=postgresql://app:secret@localhost:5432/' + response.projectName : ""}
`
  );

  fs.writeFileSync(
    path.join(target, ".gitignore"),
    `node_modules/
dist/
.env
*.db
`
  );

  console.log(`\n  ✓ Scaffolded "${response.projectName}" at ${target}\n`);
  console.log("  Next steps:");
  console.log(`    cd ${response.projectName}`);
  console.log("    npm install");
  if (response.frontend !== "none") console.log("    npm run dev         # Start frontend");
  if (hasBackend) console.log("    npm run dev:server  # Start backend");
  if (response.database !== "none") console.log("    npm run db:push     # Push DB schema");
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
