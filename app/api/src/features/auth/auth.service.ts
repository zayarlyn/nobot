import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../common/lib/prisma';
import { conflict, unauthorized } from '../../common/utils/errors';

export async function register(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw conflict('Username already taken');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, passwordHash } });
  return { id: user.id, username: user.username, isVerified: user.isVerified };
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw unauthorized('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw unauthorized('Invalid credentials');
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return { token, user: { id: user.id, username: user.username, isVerified: user.isVerified } };
}
