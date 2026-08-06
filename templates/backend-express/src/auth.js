import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from './db.js';

const secret = process.env.JWT_SECRET || 'dev-secret';
const creds = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().optional() });

export function sign(user) {
  return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

export async function signup(body) {
  const data = creds.parse(body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) {
    const err = new Error('Email taken');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({ data: { email: data.email, passwordHash, name: data.name } });
  return { token: sign(user), user: { id: user.id, email: user.email, name: user.name } };
}

export async function login(body) {
  const data = creds.parse(body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  return { token: sign(user), user: { id: user.id, email: user.email, name: user.name } };
}

export function requireAuth(header) {
  if (!header?.startsWith('Bearer ')) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return jwt.verify(header.slice(7), secret);
}
