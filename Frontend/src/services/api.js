import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (data) => api.post('/auth/register/', data),
  getMe: () => api.get('/auth/me/'),
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
};

export const teamService = {
  getAll: (params = {}) => api.get('/teams/', { params }),
  getById: (id) => api.get(`/teams/${id}/`),
  create: (data) => api.post('/teams/', data),
  update: (id, data) => api.put(`/teams/${id}/`, data),
  delete: (id) => api.delete(`/teams/${id}/`),
  getLeaderboard: (params = {}) => api.get('/teams/leaderboard/', { params }),
  addScore: (id, data) => api.post(`/teams/${id}/add_score/`, data),
  getMyTeams: () => api.get('/teams/my_teams/'),
  getStats: (id) => api.get(`/teams/${id}/stats/`),
  export: () => api.get('/teams/export/', { responseType: 'blob' }),
};

export const scoreService = {
  getAll: (teamId = null) => {
    const url = teamId ? `/scores/?team=${teamId}` : '/scores/';
    return api.get(url);
  },
  create: (data) => api.post('/scores/', data),
  delete: (id) => api.delete(`/scores/${id}/`),
  export: () => api.get('/scores/export/', { responseType: 'blob' }),
};

export const badgeService = {
  getAll: () => api.get('/badges/'),
  getById: (id) => api.get(`/badges/${id}/`),
  create: (data) => api.post('/badges/', data),
  update: (id, data) => api.put(`/badges/${id}/`, data),
  delete: (id) => api.delete(`/badges/${id}/`),
};

export const challengeService = {
  getAll: () => api.get('/challenges/'),
  getById: (id) => api.get(`/challenges/${id}/`),
  create: (data) => api.post('/challenges/', data),
  update: (id, data) => api.put(`/challenges/${id}/`, data),
  delete: (id) => api.delete(`/challenges/${id}/`),
};

export const activityLogService = {
  getAll: (params = {}) => api.get('/activity-logs/', { params }),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats/'),
};

export default api;
