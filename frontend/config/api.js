// API configuration for the Migrant application

// Base URL - update this to match your backend server URL
const BASE_URL = 'http://10.1.32.36:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    SIGNUP: `${BASE_URL}/auth/signup`,
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${BASE_URL}/auth/verify-token`,
  },
  
  // User endpoints
  USER: {
    PROFILE: `${BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${BASE_URL}/user/update`,
  },
};

// Headers configuration
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export default {
  BASE_URL,
  API_ENDPOINTS,
  getHeaders,
};
