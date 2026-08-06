import Fastify from 'fastify';
import cors from '@fastify/cors';
import { signup, login, requireAuth } from './auth.js';
import { prisma } from './db.js';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT || 4000);
await app.register(cors, { origin: process.env.CLIENT_URL || 'http://localhost:5173' });

app.get('/api/health', async () => ({ status: 'ok', backend: 'fastify' }));
app.post('/api/auth/signup', async (req, reply) => {
  try { return reply.code(201).send(await signup(req.body)); }
  catch (e) { return reply.code(e.status || 400).send({ error: e.message }); }
});
app.post('/api/auth/login', async (req, reply) => {
  try { return reply.send(await login(req.body)); }
  catch (e) { return reply.code(e.status || 400).send({ error: e.message }); }
});
app.get('/api/me', async (req, reply) => {
  try {
    const payload = requireAuth(req.headers.authorization);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    return { id: user.id, email: user.email, name: user.name };
  } catch (e) { return reply.code(e.status || 401).send({ error: e.message }); }
});

app.listen({ port, host: '0.0.0.0' });
