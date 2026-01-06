import axios from 'axios';

const api = axios.create({
    baseURL: '',
});

api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const token = JSON.parse(auth).token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired, logout the user
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
