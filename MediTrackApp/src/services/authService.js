import { api } from './api';

export const authService = {
  /**
   * Login with email and password.
   * Returns { accessToken, refreshToken, user }
   */
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  /**
   * Get current user profile.
   * Returns { user: { userId, email, role, firstName, lastName, ... } }
   */
  getMe: async () => {
    return api.get('/auth/me');
  },
};
