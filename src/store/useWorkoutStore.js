import { create } from 'zustand';
import api from '../services/api';

const useWorkoutStore = create((set, get) => ({
  exercises: [],
  schedules: [],
  currentSession: null,
  sessionsHistory: [],
  loading: false,
  error: null,

  fetchExercises: async (search = '') => {
    try {
      const response = await api.get(`/workouts/exercises${search ? `?q=${search}` : ''}`);
      set({ exercises: response.data.data });
    } catch (err) {
      console.error('Gagal mengambil daftar latihan:', err);
    }
  },

  fetchSchedules: async () => {
    try {
      const response = await api.get('/workouts/schedules');
      set({ schedules: response.data.data });
    } catch (err) {
      console.error('Gagal mengambil jadwal latihan:', err);
    }
  },

  saveSchedule: async (dayOfWeek, title) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/workouts/schedules', { dayOfWeek, title });
      set({ loading: false });
      get().fetchSchedules();
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menyimpan jadwal', loading: false });
      throw err;
    }
  },

  fetchSessionByDate: async (dateStr) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/workouts/sessions?date=${dateStr}`);
      set({ currentSession: response.data.data, loading: false });
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat sesi latihan', loading: false });
    }
  },

  updateAttendance: async (sessionId, attendanceData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/workouts/sessions/${sessionId}/attendance`, attendanceData);
      set({ currentSession: response.data.data, loading: false });
      get().fetchSessionsHistory();
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memperbarui presensi', loading: false });
      throw err;
    }
  },

  addExerciseToSession: async (sessionId, exerciseData) => {
    // exerciseData: { exerciseId, sets, reps, weight }
    try {
      const response = await api.post(`/workouts/sessions/${sessionId}/exercises`, exerciseData);
      // Refresh current session
      if (get().currentSession && get().currentSession.id === sessionId) {
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: [...state.currentSession.exercises, response.data.data],
          },
        }));
      }
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menambahkan gerakan latihan' });
      throw err;
    }
  },

  updateExerciseLog: async (sessionId, exerciseLogId, updateData) => {
    // updateData: { sets, reps, weight, completed }
    try {
      const response = await api.patch(`/workouts/sessions/${sessionId}/exercises/${exerciseLogId}`, updateData);
      // Local update to avoid full reload
      if (get().currentSession && get().currentSession.id === sessionId) {
        const updatedExercises = get().currentSession.exercises.map((log) =>
          log.id === exerciseLogId ? { ...log, ...response.data.data } : log
        );
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: updatedExercises,
          },
        }));
      }
    } catch (err) {
      console.error('Gagal memperbarui log latihan:', err);
    }
  },

  deleteExerciseFromSession: async (sessionId, exerciseLogId) => {
    try {
      await api.delete(`/workouts/sessions/${sessionId}/exercises/${exerciseLogId}`);
      if (get().currentSession && get().currentSession.id === sessionId) {
        const filtered = get().currentSession.exercises.filter((log) => log.id !== exerciseLogId);
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: filtered,
          },
        }));
      }
    } catch (err) {
      console.error('Gagal menghapus latihan dari sesi:', err);
    }
  },

  fetchSessionsHistory: async () => {
    try {
      const response = await api.get('/workouts/sessions/history');
      set({ sessionsHistory: response.data.data });
    } catch (err) {
      console.error('Gagal memuat riwayat latihan:', err);
    }
  },
}));

export default useWorkoutStore;
