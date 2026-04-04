import axios from 'axios';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_URL = `http://${LOCALHOST}:4000/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request Interceptor: Add Bearer token from Supabase session
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Provide clean errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Check if unauthorized and session might have expired.
    // NOTE: Supabase client automatically refreshes the session in the background
    // if you use supabase.auth.getSession() before requests! 
    // So if we still get 401, the user is genuinely logged out or token is dead.
    if (error.response?.status === 401) {
      // Notify store to log out
      const { useAuthStore } = await import('../store/useAuthStore');
      useAuthStore.getState().logout();
    }

    // Provide a better error structure from response
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }

    return Promise.reject(error);
  }
);

export default api;
