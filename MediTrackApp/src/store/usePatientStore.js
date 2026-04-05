import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import * as patientRepository from '../services/patientRepository';

export const usePatientStore = create((set, get) => ({
  patients: [],
  isLoading: false,
  error: null,

  fetchPatients: async () => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      set({ error: 'Oturum bulunamadı', isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await patientRepository.listPatients(doctorId);
      set({ patients: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addPatient: async (data) => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      return { success: false, error: new Error('Oturum bulunamadı') };
    }
    set({ isLoading: true, error: null });
    try {
      const newPatient = await patientRepository.createPatient(doctorId, data);
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
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      return { success: false, error: new Error('Oturum bulunamadı') };
    }
    set({ isLoading: true, error: null });
    try {
      const updatedPatient = await patientRepository.updatePatient(id, doctorId, data);
      set((state) => ({
        patients: state.patients.map((pat) =>
          pat.id === id ? { ...pat, ...updatedPatient } : pat
        ),
        isLoading: false,
      }));
      return { success: true, data: updatedPatient };
    } catch (error) {
      if (error.message === 'NOT_FOUND') {
        set({ error: 'Hasta bulunamadı', isLoading: false });
      } else {
        set({ error: error.message, isLoading: false });
      }
      return { success: false, error };
    }
  },

  deletePatient: async (id) => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      return { success: false, error: new Error('Oturum bulunamadı') };
    }
    set({ isLoading: true, error: null });
    try {
      await patientRepository.deletePatient(id, doctorId);
      set((state) => ({
        patients: state.patients.filter((pat) => pat.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      if (error.message === 'NOT_FOUND') {
        set({ error: 'Hasta bulunamadı', isLoading: false });
      } else {
        set({ error: error.message, isLoading: false });
      }
      return { success: false, error };
    }
  },

  clearPatients: () => set({ patients: [] }),
}));
