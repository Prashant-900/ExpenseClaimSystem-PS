import axios from 'axios';
import { API_URL } from '../../config/api.js';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(async (config) => {
  try {
    // Get token from localStorage
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