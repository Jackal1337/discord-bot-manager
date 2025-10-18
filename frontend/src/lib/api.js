import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Axios instance s automatickým token headerem
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Přidat Authorization header ke každému requestu
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized (redirect na login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    axios.post(`${API_BASE_URL}/auth/login`, { username, password }),
};

// Bots API
export const botsAPI = {
  getAll: () => api.get('/bots'),
  getOne: (id) => api.get(`/bots/${id}`),
  create: (data) => api.post('/bots', data),
  update: (id, data) => api.put(`/bots/${id}`, data),
  delete: (id) => api.delete(`/bots/${id}`),
  start: (id) => api.post(`/bots/${id}/start`),
  stop: (id) => api.post(`/bots/${id}/stop`),
  restart: (id) => api.post(`/bots/${id}/restart`),
  getLogs: (id, lines = 100) => api.get(`/bots/${id}/logs?lines=${lines}`),
  getHistory: (id) => api.get(`/bots/${id}/history`),
  getMetrics: (id, hours = 1) => api.get(`/bots/${id}/metrics?hours=${hours}`),
};

// Stats API
export const statsAPI = {
  get: () => api.get('/stats'),
};

// Parse .env API
export const envAPI = {
  parseEnv: (script_path) => api.post('/parse-env', { script_path }),
};

export default api;
