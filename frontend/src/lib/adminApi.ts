import axios from 'axios';
import { useAdminStore } from '../store/useAdminStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Separate axios instance for admin API calls.
 * Reads the admin JWT token from useAdminStore (not useAuthStore),
 * so admin requests are always authenticated with the admin session.
 */
export const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject admin token on every request
adminApi.interceptors.request.use(
  (config) => {
    const token = useAdminStore.getState().adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Normalise error messages
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);
