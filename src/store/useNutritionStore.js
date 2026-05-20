import { create } from 'zustand';
import api from '../services/api';

const useNutritionStore = create((set) => ({
  nutritionPlan: null,
  recommendations: null,
  loading: false,
  error: null,

  fetchNutritionPlan: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/nutrition/plan');
      set({ nutritionPlan: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat rencana nutrisi', loading: false });
    }
  },

  fetchRecommendations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/nutrition/recommendations');
      set({ recommendations: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat rekomendasi nutrisi', loading: false });
    }
  },
}));

export default useNutritionStore;
