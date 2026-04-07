import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8088/api',
});

// Intercept requests to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password) => api.post('/auth/register', { username, password }),
};

export const userService = {
  getDetails: () => api.get('/user/details'),
  updateDetails: (data) => api.post('/user/details', data),
};

export const transactionService = {
  getAll: () => api.get('/transactions'),
  add: (data) => api.post('/transactions', data),
  delete: (id) => api.delete(`/transactions/${id}`),
};
