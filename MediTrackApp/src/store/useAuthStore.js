import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { ACCOUNT_STATUS } from '../constants/accountStatus';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isRestoringProfile: false,
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
            .select('first_name, last_name, role, title, department, sicil, account_status')
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
            sicil: profile?.sicil,
            accountStatus: profile?.account_status ?? ACCOUNT_STATUS.ACTIVE,
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
          const { data: inserted, error: insertErr } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: payload.email,
              first_name: payload.firstName,
              last_name: payload.lastName,
              role: 'doctor',
              title: payload.title || 'Doktor',
              department: payload.department || 'Bilinmiyor',
              is_active: true,
              account_status: ACCOUNT_STATUS.PENDING,
            })
            .select('first_name, last_name, role, title, department, sicil, account_status')
            .single();

          if (insertErr) throw insertErr;

          const createdUser = {
            userId: data.user.id,
            email: payload.email,
            firstName: inserted?.first_name ?? payload.firstName,
            lastName: inserted?.last_name ?? payload.lastName,
            role: 'doctor',
            title: inserted?.title ?? (payload.title || 'Doktor'),
            department: inserted?.department ?? (payload.department || 'Bilinmiyor'),
            sicil: inserted?.sicil,
            accountStatus: inserted?.account_status ?? ACCOUNT_STATUS.PENDING,
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

      /** Sunucudan profili yeniler (onay sonrası vb.) */
      refreshAccountProfile: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data: profile } = await supabase
          .from('users')
          .select('first_name, last_name, role, title, department, sicil, account_status')
          .eq('id', session.user.id)
          .single();
        if (!profile) return;
        set({
          user: {
            userId: session.user.id,
            email: session.user.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: profile.role,
            title: profile.title,
            department: profile.department,
            sicil: profile.sicil,
            accountStatus: profile.account_status ?? ACCOUNT_STATUS.ACTIVE,
          },
        });
      },

      setHydrated: () => set({ isHydrated: true }),
      
      // Called on app mount to restore session automatically if async storage has token
      restoreSession: async () => {
        set({ isRestoringProfile: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session && session.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('first_name, last_name, role, title, department, sicil, account_status')
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
              sicil: profile?.sicil,
              accountStatus: profile?.account_status ?? ACCOUNT_STATUS.ACTIVE,
            };

            set({
              user: combinedUser,
              isAuthenticated: true,
              isHydrated: true,
            });
          } else {
            set({ isAuthenticated: false, isHydrated: true });
          }
        } catch {
          set({ isAuthenticated: false, isHydrated: true });
        } finally {
          set({ isRestoringProfile: false });
        }
      },
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
        state?.restoreSession();
      },
    },
  ),
);
