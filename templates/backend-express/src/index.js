import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { signup, login, requireAuth } from './auth.js';
import { prisma } from './db.js';

const app = express();
const port = Number(process.env.PORT || 4000);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', backend: 'express' }));
app.post('/api/auth/signup', async (req, res) => {
  try { res.status(201).json(await signup(req.body)); }
  catch (e) { res.status(e.status || 400).json({ error: e.message }); }
});
app.post('/api/auth/login', async (req, res) => {
  try { res.json(await login(req.body)); }
  catch (e) { res.status(e.status || 400).json({ error: e.message }); }
});
app.get('/api/me', async (req, res) => {
  try {
    const payload = requireAuth(req.headers.authorization);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) { res.status(e.status || 401).json({ error: e.message }); }
});

app.listen(port, () => console.log(`API (express) http://localhost:${port}`));
