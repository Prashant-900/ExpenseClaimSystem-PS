import { create } from 'zustand';
import API from '../../shared/services/axios.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await API.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const { data } = await API.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) return;
    
    try {
      const { data } = await API.get('/auth/me');
      set({ user: data });
    } catch (error) {
      if (error.response?.status === 401) {
        get().logout();
      }
    }
  },

  setAuthData: (token, user) => {
    set({ token, user });
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  }
}));