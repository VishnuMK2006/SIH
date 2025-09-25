// const BASE_URL = 'http://10.246.199.143:5000/api';
const BASE_URL = 'http://192.168.137.1:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    SIGNUP: `${BASE_URL}/auth/signup`,
    LOGIN: `${BASE_URL}/auth/patient/login`, // Updated to use patient login
    LOGOUT: `${BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${BASE_URL}/auth/verify-token`,
  },
  
  // Patient endpoints
  PATIENT: {
    DETAILS: `${BASE_URL}/auth/patient/details`, // New patient details endpoint
    PROFILE: `${BASE_URL}/auth/patient/details`, // Can be used for profile as well
  },
  
  // User endpoints (kept for backward compatibility)
  USER: {
    PROFILE: `${BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${BASE_URL}/user/update`,
  },

  // Hospital endpoints
  HOSPITAL: {
    GET_ALL: `${BASE_URL}/hospitals`,
    GET_BY_ID: (hospitalId) => `${BASE_URL}/hospitals/${hospitalId}`,
    GET_BY_DISTRICT: (district) => `${BASE_URL}/hospitals/district/${district}`,
    GET_STATS: `${BASE_URL}/hospitals/stats`,
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
