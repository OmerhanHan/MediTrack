import type { FastifyInstance } from 'fastify';
import type { AuthUser } from '../../common/types.js';
import { supabase } from '../../config/supabase.js';
import type { RegisterInput } from './auth.schemas.js';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export async function login(app: FastifyInstance, email: string, password: string): Promise<AuthTokens | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return null;
  }

  // Check if they exist and are active in our public.users
  const { data: dbUser } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single();

  if (!dbUser || !dbUser.is_active) {
    return null;
  }

  const user: AuthUser = {
    userId: data.user.id,
    email: data.user.email!,
    role: (dbUser.role as AuthUser['role']) || 'doctor',
  };

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user,
  };
}

export async function register(app: FastifyInstance, payload: RegisterInput): Promise<AuthTokens> {
  // 1. Register with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message || 'Failed to sign up');
  }

  // 2. Create the user profile in public.users
  await supabase.from('users').insert({
    id: data.user.id,
    email: payload.email,
    role: 'doctor', // Default role
    first_name: payload.firstName,
    last_name: payload.lastName,
    title: payload.title || 'Doktor',
    department: payload.department || 'Bilinmiyor',
    is_active: true,
  });

  const user: AuthUser = {
    userId: data.user.id,
    email: data.user.email!,
    role: 'doctor',
  };

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user,
  };
}

export async function rotateRefreshToken(app: FastifyInstance, token: string): Promise<AuthTokens | null> {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: token });

  if (error || !data.session || !data.user) {
    return null;
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const user: AuthUser = {
    userId: data.user.id,
    email: data.user.email!,
    role: (dbUser?.role as AuthUser['role']) || 'doctor',
  };

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user,
  };
}

/**
 * Get full user profile from DB.
 */
export async function getUserProfile(userId: string) {
  const { data: dbUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !dbUser) return null;

  return {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    title: dbUser.title,
    department: dbUser.department,
  };
}
