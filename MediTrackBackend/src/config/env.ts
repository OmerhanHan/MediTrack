import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:19006'),
  DATABASE_URL: z.string().default('postgresql://meditrack:meditrack_dev_2026@localhost:5432/meditrack'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ENCRYPTION_KEY: z.string().min(32).default('meditrack-dev-key-change-in-prod!'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .refine((value) => !value.includes('change-me'), 'JWT_ACCESS_SECRET must be replaced with a secure value'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .refine((value) => !value.includes('change-me'), 'JWT_REFRESH_SECRET must be replaced with a secure value'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast for misconfigured secrets and ports.
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
