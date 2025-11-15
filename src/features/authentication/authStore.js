import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Initialize from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (error) {
    console.error('Error initializing auth state:', error);
    return { token: null, user: null };
  }
};

const initialState = getInitialState();

export const useAuthStore = create((set, get) => ({
  user: initialState.user,
  token: initialState.token,
  isLoading: false,

  // Register new user with email/password
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      set({ isLoading: false });
      return { success: true, requiresVerification: true, email: response.data.email };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  // Verify email with OTP
  verifyEmail: async (email, otp) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, { email, otp });
      const { token, user } = response.data;
      set({ token, user, isLoading: false });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Verification failed' };
    }
  },

  // Resend OTP
  resendOtp: async (email) => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/auth/resend-otp`, { email });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Failed to resend OTP' };
    }
  },

  // Login with email/password
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      set({ token, user, isLoading: false });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  // Logout - clears local store and all auth data
  logout: () => {
    console.log('Clearing auth store...');
    set({ user: null, token: null, isLoading: false });
    
    // Clear localStorage and sessionStorage
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (err) {
      console.error('Error clearing storage:', err);
    }
  },

  // Update user
  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },

  // Set auth data
  setAuthData: (token, user) => {
    set({ token, user });
  },

  // Get current auth state
  getAuthState: () => {
    return { user: get().user, token: get().token };
  }
}));