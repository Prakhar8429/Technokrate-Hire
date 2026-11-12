import axios from 'axios';
import { getToken } from '../storage/authStorage';

export const BASE_URL = 'https://new-job-portal-be-dh8v.onrender.com/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach Bearer token if present
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Continue without token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: extract user-friendly error messages and protect credentials
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string') {
        const trimmed = data.trim();
        friendlyMessage = trimmed === 'Not Found' ? 'Unable to reach the service. Please try again.' : trimmed;
      } else if (data && data.message) {
        friendlyMessage = data.message;
      } else if (data && data.error) {
        friendlyMessage = data.error;
      } else if (error.response.status === 404) {
        friendlyMessage = 'Requested service endpoint was not found on server.';
      } else if (error.response.status === 401) {
        friendlyMessage = 'Invalid credentials or session expired.';
      } else if (error.response.status === 400) {
        friendlyMessage = 'Invalid request details provided.';
      } else if (error.response.status >= 500) {
        friendlyMessage = 'Server is currently experiencing issues. Please try again later.';
      }
    } else if (error.request) {
      friendlyMessage = 'Network connection issue. Please check your internet connection.';
    } else if (error.message) {
      friendlyMessage = error.message;
    }

    const enhancedError = new Error(friendlyMessage);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    enhancedError.isNetworkError = !error.response;

    return Promise.reject(enhancedError);
  }
);

export default client;
