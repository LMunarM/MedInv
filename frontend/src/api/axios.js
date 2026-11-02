import axios from 'axios';

const api = axios.create({
  baseURL: 'https://medinv.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medinv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;