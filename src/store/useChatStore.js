import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set) => ({
  messages: [],
  loading: false,
  sending: false,
  error: null,

  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/ai/history');
      set({ messages: response.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat riwayat obrolan', loading: false });
    }
  },

  sendMessage: async (content) => {
    set({ sending: true, error: null });
    // Tambah pesan user secara lokal terlebih dahulu agar UI terasa cepat
    const tempUserMsg = { id: Date.now(), role: 'USER', content, createdAt: new Date() };
    set((state) => ({ messages: [...state.messages, tempUserMsg] }));

    try {
      const response = await api.post('/ai/chat', { message: content });
      const aiResponse = response.data.data;
      
      // Hapus pesan sementara dan gantikan dengan pesan resmi dari server
      set((state) => {
        const filtered = state.messages.filter((m) => m.id !== tempUserMsg.id);
        return {
          messages: [...filtered, tempUserMsg, aiResponse],
          sending: false,
        };
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Gagal mengirim pesan',
        sending: false,
      });
      // Saring pesan sementara jika gagal terkirim agar user tahu ada error
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempUserMsg.id),
      }));
      throw err;
    }
  },

  clearHistory: async () => {
    set({ loading: true });
    try {
      await api.delete('/ai/history');
      set({ messages: [], loading: false });
    } catch {
      set({ error: 'Gagal menghapus riwayat obrolan', loading: false });
    }
  },
}));

export default useChatStore;
