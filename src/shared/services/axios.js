import axios from 'axios';
import { API_URL } from '../../config/api.js';

const API = axios.create({
  baseURL: API_URL,
});

// Store for the getToken function - will be set by the app
let getTokenFunction = null;

export const setGetTokenFunction = (fn) => {
  getTokenFunction = fn;
};

API.interceptors.request.use(async (config) => {
  try {
    // Try to get Clerk token first (for authenticated requests)
    if (getTokenFunction) {
      try {
        const token = await getTokenFunction();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      } catch (error) {
        console.warn('Failed to get Clerk token:', error.message);
        // Continue without token if Clerk fails
      }
    }
    
    // Fallback to localStorage token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
  } catch (error) {
    console.error('Error in axios interceptor:', error);
  }
  return config;
});

export default API;