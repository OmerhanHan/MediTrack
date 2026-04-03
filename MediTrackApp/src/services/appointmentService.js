import { api } from './api';

export const appointmentService = {
  /**
   * List all appointments for the logged-in doctor.
   */
  list: async () => {
    return api.get('/appointments');
  },

  /**
   * Create a new appointment.
   */
  create: async (data) => {
    return api.post('/appointments', data);
  },
};
