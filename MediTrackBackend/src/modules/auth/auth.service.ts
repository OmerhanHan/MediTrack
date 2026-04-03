import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import type { AuthUser } from '../../common/types.js';
import { env } from '../../config/env.js';
import { hashPassword, verifyPassword } from '../../common/password.js';
import { prisma } from '../../plugins/prisma.js';
import { saveRefreshToken, consumeRefreshToken } from './token-store.js';
import type { RegisterInput } from './auth.schemas.js';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

function refreshTtlMs() {
  const amount = Number(env.JWT_REFRESH_TTL.replace(/[^\d]/g, '')) || 7;
  if (env.JWT_REFRESH_TTL.includes('d')) return amount * 24 * 60 * 60 * 1000;
  if (env.JWT_REFRESH_TTL.includes('h')) return amount * 60 * 60 * 1000;
  return amount * 1000;
}

export async function login(app: FastifyInstance, email: string, password: string): Promise<AuthTokens | null> {
  // Look up user from database
  const dbUser = await prisma.user.findUnique({ where: { email } });

  if (!dbUser || !dbUser.isActive) {
    return null;
  }

  // Verify password using bcrypt
  const isValid = await verifyPassword(password, dbUser.passwordHash);
  if (!isValid) {
    return null;
  }

  const user: AuthUser = {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role as AuthUser['role'],
  };

  const accessToken = await app.jwt.sign(user);
  const refreshToken = crypto.randomUUID() + crypto.randomUUID();
  await saveRefreshToken(refreshToken, user, Date.now() + refreshTtlMs());

  return { accessToken, refreshToken, user };
}

export async function register(app: FastifyInstance, payload: RegisterInput): Promise<AuthTokens> {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw new Error('EMAIL_EXISTS');
  }

  const hashedPassword = await hashPassword(payload.password);

  const dbUser = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash: hashedPassword,
      firstName: payload.firstName,
      lastName: payload.lastName,
      title: payload.title || 'Doktor',
      department: payload.department || 'Bilinmiyor',
      role: 'doctor', // Default role for now
    },
  });

  const user: AuthUser = {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role as AuthUser['role'],
  };

  const accessToken = await app.jwt.sign(user);
  const refreshToken = crypto.randomUUID() + crypto.randomUUID();
  await saveRefreshToken(refreshToken, user, Date.now() + refreshTtlMs());

  return { accessToken, refreshToken, user };
}

export async function rotateRefreshToken(app: FastifyInstance, token: string): Promise<AuthTokens | null> {
  const consumed = await consumeRefreshToken(token);
  if (!consumed || Date.now() > consumed.expiresAt) {
    return null;
  }

  const user: AuthUser = consumed.user;

  const accessToken = await app.jwt.sign(user);
  const refreshToken = crypto.randomUUID() + crypto.randomUUID();
  await saveRefreshToken(refreshToken, user, Date.now() + refreshTtlMs());

  return { accessToken, refreshToken, user };
}

/**
 * Get full user profile from DB.
 */
export async function getUserProfile(userId: string) {
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return null;

  return {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    title: dbUser.title,
    department: dbUser.department,
  };
}
