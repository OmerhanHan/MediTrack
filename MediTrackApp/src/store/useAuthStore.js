import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

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
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          
          if (error) {
            let msg = error.message;
            if (msg.includes('Invalid login credentials')) msg = 'E-posta veya şifre hatalı.';
            throw new Error(msg);
          }
          
          // Fetch additional profile data (role, first/last name) from Supabase public schema
          const { data: profile } = await supabase
            .from('users')
            .select('first_name, last_name, role, title, department')
            .eq('id', data.user.id)
            .single();

          const combinedUser = {
            userId: data.user.id,
            email: data.user.email,
            firstName: profile?.first_name,
            lastName: profile?.last_name,
            role: profile?.role,
            title: profile?.title,
            department: profile?.department,
          };

          set({
            user: combinedUser,
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

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
          });

          if (error) {
            let msg = error.message;
            if (msg.includes('already registered')) msg = 'Bu e-posta adresi zaten kullanımda.';
            throw new Error(msg);
          }

          if (!data.user) throw new Error('Registration failed, no user returned.');

          // Create the custom user record in public.users
          await supabase.from('users').insert({
            id: data.user.id,
            email: payload.email,
            first_name: payload.firstName,
            last_name: payload.lastName,
            role: 'doctor', // default
            title: payload.title || 'Doktor',
            department: payload.department || 'Bilinmiyor',
            is_active: true
          });

          const createdUser = {
            userId: data.user.id,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            role: 'doctor',
            title: payload.title || 'Doktor',
            department: payload.department || 'Bilinmiyor',
          };

          set({
            user: createdUser,
            isAuthenticated: true, // Auto login since email confirmation is assumed disabled
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
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      updateProfile: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),

      setHydrated: () => set({ isHydrated: true }),
      
      // Called on app mount to restore session automatically if async storage has token
      restoreSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Re-fetch profile
          const { data: profile } = await supabase
            .from('users')
            .select('first_name, last_name, role, title, department')
            .eq('id', session.user.id)
            .single();

          const combinedUser = {
            userId: session.user.id,
            email: session.user.email,
            firstName: profile?.first_name,
            lastName: profile?.last_name,
            role: profile?.role,
            title: profile?.title,
            department: profile?.department,
          };
          
          set({
            user: combinedUser,
            isAuthenticated: true,
            isHydrated: true
          });
        } else {
          set({ isAuthenticated: false, isHydrated: true });
        }
      }
    }),
    {
      name: 'meditrack-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // We don't actually need to store session state since supabase handles it natively.
      // But we persist user state for faster UI loads.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        // Fire async session restore so it matches reality
        state?.restoreSession();
      },
    },
  ),
);
