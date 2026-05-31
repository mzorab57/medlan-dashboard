import { create } from 'zustand';
import { api } from '../lib/api';

export const useAuth = create((set) => ({
  user: null,
  loading: false,
  error: null,
  async login(username, password) {
    set({ loading: true, error: null });
    try {
      await api.post('/api/auth/login', { username, password });
      const me = await api.get('/api/auth/me');
      set({ user: me?.user ?? me, loading: false });
      return true;
    } catch (e) {
      set({ error: e.message, loading: false });
      return false;
    }
  },
  async logout() {
    try {
      await api.post('/api/auth/logout', {});
    } catch (e) { void e; }
    set({ user: null });
  },
  async fetchMe() {
    set({ loading: true, error: null });
    try {
      const me = await api.get('/api/auth/me');
      set({ user: me?.user ?? me, loading: false });
    } catch (e) {
      void e;
      set({ user: null, loading: false });
    }
  },
}));
