import { create } from 'zustand';
import api from '../services/api';

const useAdminStore = create((set, get) => ({
  users: [],
  exercises: [],
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/stats');
      set({ stats: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat statistik', loading: false });
    }
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/users');
      set({ users: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat pengguna', loading: false });
    }
  },

  fetchExercises: async () => {
    set({ loading: true, error: null });
    try {
      // Reuse user exercise endpoint to read exercises
      const response = await api.get('/workouts/exercises');
      set({ exercises: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat gerakan latihan', loading: false });
    }
  },

  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      set({ loading: false });
      get().fetchUsers();
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memperbarui pengguna', loading: false });
      throw err;
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/users/${userId}`);
      set({ loading: false });
      // Update local state
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
      }));
      // Refresh stats if loaded
      if (get().stats) {
        get().fetchStats();
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menghapus pengguna', loading: false });
      throw err;
    }
  },

  addExercise: async (exerciseData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/admin/exercises', exerciseData);
      set({ loading: false });
      // Update local state
      set((state) => ({
        exercises: [response.data.data, ...state.exercises]
      }));
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menambahkan gerakan latihan', loading: false });
      throw err;
    }
  },

  deleteExercise: async (exerciseId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/exercises/${exerciseId}`);
      set({ loading: false });
      // Update local state
      set((state) => ({
        exercises: state.exercises.filter((ex) => ex.id !== exerciseId)
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menghapus gerakan latihan', loading: false });
      throw err;
    }
  },
}));

export default useAdminStore;
