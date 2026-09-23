import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinevault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cinevault_token');
      localStorage.removeItem('cinevault_user');
    }
    const message =
      error.response?.data?.message ||  
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default client;
