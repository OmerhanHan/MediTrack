import type { AuthUser } from '../../common/types.js';
import { redis } from '../../plugins/redis.js';

const TOKEN_PREFIX = 'refresh_token:';

type StoredToken = {
  user: AuthUser;
  expiresAt: number;
};

/**
 * Save a refresh token to Redis with TTL.
 */
export async function saveRefreshToken(token: string, user: AuthUser, expiresAt: number): Promise<void> {
  const data: StoredToken = { user, expiresAt };
  const ttlMs = expiresAt - Date.now();
  const ttlSeconds = Math.max(Math.ceil(ttlMs / 1000), 1);

  await redis.set(
    `${TOKEN_PREFIX}${token}`,
    JSON.stringify(data),
    'EX',
    ttlSeconds,
  );
}

/**
 * Consume (get and delete) a refresh token from Redis.
 * Returns null if the token doesn't exist.
 */
export async function consumeRefreshToken(token: string): Promise<StoredToken | null> {
  const key = `${TOKEN_PREFIX}${token}`;
  const raw = await redis.get(key);

  if (!raw) return null;

  // Delete after reading (one-time use)
  await redis.del(key);

  return JSON.parse(raw) as StoredToken;
}
