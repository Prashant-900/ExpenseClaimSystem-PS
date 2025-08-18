import axios from 'axios';

const API = axios.create({
  baseURL: 'https://kjx5f691-5000.inc1.devtunnels.ms/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;