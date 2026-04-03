import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_URL = `http://${LOCALHOST}:4000/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Keys for SecureStore
const ACCESS_TOKEN_KEY = 'meditrack_access_token';
const REFRESH_TOKEN_KEY = 'meditrack_refresh_token';

// In-memory tokens for faster access
let currentAccessToken = null;

export const setTokens = async (accessToken, refreshToken) => {
  currentAccessToken = accessToken;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = async () => {
  currentAccessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const getAccessToken = async () => {
  if (currentAccessToken) return currentAccessToken;
  
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    currentAccessToken = token;
    return token;
  }
  return null;
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

// Request Interceptor: add bearer token if available
api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 and refresh token loop
api.interceptors.response.use(
  (response) => response.data, // Since backend usually sends { data: ... } or just obj
  async (error) => {
    const originalRequest = error.config;
    
    // Eğer istek login veya register ise interceptor karışmamalı
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
      if (error.response?.data?.message) {
        let msg = error.response.data.message;
        if (msg === 'Invalid credentials') msg = 'E-posta veya şifre hatalı.';
        if (msg === 'This email is already registered.') msg = 'Bu e-posta adresi zaten kullanımda.';
        error.message = msg;
      }
      return Promise.reject(error);
    }
    
    // Eğer istek unauthorized (401) dönerse ve bu aynı orijinal istek için ilk başarısız denemeyse
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Create a new axios instance to avoid circular interceptors
        const refreshAxios = axios.create();
        const refreshResponse = await refreshAxios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccess, refreshToken: newRefresh } = refreshResponse.data.data;
        
        await setTokens(newAccess, newRefresh);
        
        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh token invalid or expired, clear tokens
        await clearTokens();
        
        // Notify store about auth failure (we'll implement an event or let zustand subscribe)
        const { useAuthStore } = await import('../store/useAuthStore');
        useAuthStore.getState().logout();
        
        return Promise.reject(refreshError);
      }
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
