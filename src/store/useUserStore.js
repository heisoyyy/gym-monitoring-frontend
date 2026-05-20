import { create } from 'zustand';
import api from '../services/api';

const useUserStore = create((set, get) => ({
  profileDetails: null,
  bodyHistory: [],
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/user/profile');
      set({ profileDetails: response.data.data, loading: false });
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat profil', loading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/user/profile', profileData);
      set({ profileDetails: response.data.data, loading: false });
      // Refresh history setelah profil diperbarui karena BB baru masuk history
      get().fetchHistory();
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memperbarui profil', loading: false });
      throw err;
    }
  },

  fetchHistory: async () => {
    try {
      const response = await api.get('/body/history');
      set({ bodyHistory: response.data.data });
    } catch (err) {
      console.error('Gagal mengambil riwayat berat badan:', err);
    }
  },

  logWeight: async (weight) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/body/history', { weight });
      set({ loading: false });
      // Refresh data profil dan riwayat
      get().fetchProfile();
      get().fetchHistory();
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal mencatat berat badan', loading: false });
      throw err;
    }
  },
}));

export default useUserStore;
