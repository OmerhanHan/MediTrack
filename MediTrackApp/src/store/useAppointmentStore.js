import { create } from 'zustand';
import api from '../services/api';

export const useAppointmentStore = create((set, get) => ({
  // ── State ──
  appointments: [],
  selectedDate: null,
  isLoading: false,
  error: null,

  // ── Actions ──
  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/appointments');
      // Assume API returns { data: [...] }
      set({ appointments: response.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addAppointment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/appointments', data);
      const newAppointment = response.data;
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false,
      }));
      return { success: true, data: newAppointment };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  updateAppointment: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/appointments/${id}`, updates);
      const updatedAppt = response.data;
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? { ...apt, ...updatedAppt } : apt
        ),
        isLoading: false,
      }));
      return { success: true, data: updatedAppt };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  cancelAppointment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/appointments/${id}`, { status: 'cancelled' });
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? { ...apt, status: 'cancelled' } : apt
        ),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  deleteAppointment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/appointments/${id}`);
      set((state) => ({
        appointments: state.appointments.filter((apt) => apt.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  setAppointments: (appointments) => set({ appointments }),
  setLoading: (isLoading) => set({ isLoading }),

  // ── Selectors (computed) ──
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
      // Expecting format YYYY-MM-DD
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
