import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import type { AuthUser } from '../../common/types.js';
import { env } from '../../config/env.js';
import { consumeRefreshToken, saveRefreshToken } from './token-store.js';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

const DEMO_USER: AuthUser & { password: string } = {
  userId: 'doctor-1',
  email: 'doktor@meditrack.app',
  role: 'doctor',
  password: 'Password123!',
};

function refreshTtlMs() {
  const amount = Number(env.JWT_REFRESH_TTL.replace(/[^\d]/g, '')) || 7;
  if (env.JWT_REFRESH_TTL.includes('d')) return amount * 24 * 60 * 60 * 1000;
  if (env.JWT_REFRESH_TTL.includes('h')) return amount * 60 * 60 * 1000;
  return amount * 1000;
}

export async function login(app: FastifyInstance, email: string, password: string): Promise<AuthTokens | null> {
  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    return null;
  }

  const user: AuthUser = {
    userId: DEMO_USER.userId,
    email: DEMO_USER.email,
    role: DEMO_USER.role,
  };

  const accessToken = await app.jwt.sign(user);
  const refreshToken = crypto.randomUUID() + crypto.randomUUID();
  saveRefreshToken(refreshToken, user.userId, Date.now() + refreshTtlMs());

  return { accessToken, refreshToken, user };
}

export async function rotateRefreshToken(app: FastifyInstance, token: string): Promise<AuthTokens | null> {
  const consumed = consumeRefreshToken(token);
  if (!consumed || Date.now() > consumed.expiresAt) {
    return null;
  }

  const user: AuthUser = {
    userId: consumed.userId,
    email: DEMO_USER.email,
    role: DEMO_USER.role,
  };

  const accessToken = await app.jwt.sign(user);
  const refreshToken = crypto.randomUUID() + crypto.randomUUID();
  saveRefreshToken(refreshToken, user.userId, Date.now() + refreshTtlMs());

  return { accessToken, refreshToken, user };
}
