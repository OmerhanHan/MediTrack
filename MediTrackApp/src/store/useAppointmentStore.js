import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import * as appointmentRepository from '../services/appointmentRepository';

export const useAppointmentStore = create((set, get) => ({
  appointments: [],
  selectedDate: null,
  isLoading: false,
  error: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchAppointments: async () => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      set({ error: 'Oturum bulunamadı', isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await appointmentRepository.listAppointments(doctorId);
      set({ appointments: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addAppointment: async (data) => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      return { success: false, error: new Error('Oturum bulunamadı') };
    }
    set({ isLoading: true, error: null });
    try {
      const newAppointment = await appointmentRepository.createAppointment(doctorId, data);
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false,
      }));
      return { success: true, data: newAppointment };
    } catch (error) {
      if (error.code === 'APPOINTMENT_CONFLICT' || error.message === 'APPOINTMENT_CONFLICT') {
        set({ error: 'Bu saat için zaten randevu var', isLoading: false });
      } else {
        set({ error: error.message, isLoading: false });
      }
      return { success: false, error };
    }
  },

  updateAppointment: async (id, updates) => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      return { success: false, error: new Error('Oturum bulunamadı') };
    }
    set({ isLoading: true, error: null });
    try {
      const updatedAppt = await appointmentRepository.updateAppointment(doctorId, id, updates);
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? { ...apt, ...updatedAppt } : apt
        ),
        isLoading: false,
      }));
      return { success: true, data: updatedAppt };
    } catch (error) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        set({ error: 'Randevu bulunamadı', isLoading: false });
      } else {
        set({ error: error.message, isLoading: false });
      }
      return { success: false, error };
    }
  },

  cancelAppointment: async (id) => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      return { success: false, error: new Error('Oturum bulunamadı') };
    }
    set({ isLoading: true, error: null });
    try {
      await appointmentRepository.updateAppointment(doctorId, id, { status: 'cancelled' });
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? { ...apt, status: 'cancelled' } : apt
        ),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        set({ error: 'Randevu bulunamadı', isLoading: false });
      } else {
        set({ error: error.message, isLoading: false });
      }
      return { success: false, error };
    }
  },

  deleteAppointment: async (id) => {
    const doctorId = useAuthStore.getState().user?.userId;
    if (!doctorId) {
      return { success: false, error: new Error('Oturum bulunamadı') };
    }
    set({ isLoading: true, error: null });
    try {
      await appointmentRepository.deleteAppointment(doctorId, id);
      set((state) => ({
        appointments: state.appointments.filter((apt) => apt.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        set({ error: 'Randevu bulunamadı', isLoading: false });
      } else {
        set({ error: error.message, isLoading: false });
      }
      return { success: false, error };
    }
  },

  setAppointments: (appointments) => set({ appointments }),
  setLoading: (isLoading) => set({ isLoading }),

  getAppointmentsByDate: (date) => {
    return get().appointments.filter((apt) => apt.date === date);
  },

  getTodayAppointments: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().appointments.filter((apt) => apt.date === today);
  },

  getDailyStats: (date) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dayAppointments = get().appointments.filter((apt) => apt.date === targetDate);
    const total = dayAppointments.length;
    const completed = dayAppointments.filter((apt) => apt.status === 'completed').length;
    const upcoming = dayAppointments.filter(
      (apt) => apt.status === 'upcoming' || apt.status === 'next',
    ).length;
    const newPatients = dayAppointments.filter((apt) => apt.type === 'İlk Muayene').length;

    return { total, completed, upcoming, newPatients };
  },

  getDayLoadMap: () => {
    const loadMap = {};
    get().appointments.forEach((apt) => {
      const dateParts = apt.date?.split('-');
      if (!dateParts || dateParts.length < 3) return;
      const day = parseInt(dateParts[2], 10);
      const count = (loadMap[day]?.count || 0) + 1;
      let load = 'low';
      if (count >= 5) load = 'high';
      else if (count >= 3) load = 'med';
      loadMap[day] = { count, load };
    });
    return loadMap;
  },
}));
