import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setTokens, clearTokens } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      error: null,

      // ── Actions ──
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = response;
          
          await setTokens(accessToken, refreshToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { success: true };
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Giriş işlemi başarısız oldu'
          });
          return { success: false, error };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', data);
          const { user, accessToken, refreshToken } = response;
          
          await setTokens(accessToken, refreshToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { success: true };
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Kayıt işlemi başarısız oldu'
          });
          return { success: false, error };
        }
      },

      logout: async () => {
        // İsteğe bağlı olarak backend'e logout atılabilir: await api.post('/auth/logout');
        await clearTokens();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateProfile: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'meditrack-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Sadece token HARİÇ güvenlik için gerekli olmayan bilgileri AsyncStorage'da tut
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
