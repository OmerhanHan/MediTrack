import { create } from 'zustand';
import api from '../services/api';

export const usePatientStore = create((set, get) => ({
  // ── State ──
  patients: [],
  isLoading: false,
  error: null,

  // ── Actions ──
  fetchPatients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/patients');
      // Assume API returns array or { data: [...] }
      const data = Array.isArray(response) ? response : response.data || [];
      set({ patients: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addPatient: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/patients', data);
      const newPatient = response.data || response;
      set((state) => ({
        patients: [...state.patients, newPatient],
        isLoading: false,
      }));
      return { success: true, data: newPatient };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  updatePatient: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/patients/${id}`, data);
      const updatedPatient = response.data || response;
      set((state) => ({
        patients: state.patients.map((pat) =>
          pat.id === id ? { ...pat, ...updatedPatient } : pat
        ),
        isLoading: false,
      }));
      return { success: true, data: updatedPatient };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  deletePatient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/patients/${id}`);
      set((state) => ({
        patients: state.patients.filter((pat) => pat.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  clearPatients: () => set({ patients: [] }),
}));
