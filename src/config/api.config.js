/**
 * API Configuration
 * This file contains the configuration for the API
 */

// Base URL for API requests
export const API_BASE_URL = 'https://binc-b.onrender.com/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH_TOKEN: '/auth/token/refresh/',
    VERIFY_TOKEN: '/auth/token/verify/',
  },
  
  // Dashboard endpoints
  DASHBOARD: {
    STATS: '/dashboard/stats/',
    PRODUCTS: '/dashboard/products/',
    PRODUCT_DETAIL: (id) => `/dashboard/products/${id}/`,
    ANALYTICS: '/dashboard/analytics/',
    SETTINGS: '/dashboard/settings/',
  },
  
  // Products endpoints
  PRODUCTS: {
    LIST: '/products/',
    DETAIL: (id) => `/products/${id}/`,
    FEATURED: '/products/featured/',
    POPULAR: '/products/popular/',
    NEW: '/products/new/',
    SEARCH: '/products/search/',
<<<<<<< HEAD
    CATEGORIES: '/categories/',
    REACTIONS: {
      TOGGLE: (id) => `/products/${id}/reaction/`,
      GET_USER_REACTION: (id) => `/products/${id}/reaction/`,
    },
=======
    CATEGORIES: '/products/categories/',
>>>>>>> 4896dde5262c4b71df7c49a42dd5043f51aa31ae
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile/',
    FAVORITES: '/user/favorites/',
    PREFERENCES: '/user/preferences/',
  },
  
  // Comparison endpoints
  COMPARISON: {
    COMPARE: (productId) => `/comparison/${productId}/compare/`,
  },
};

// Request configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server error. Our team has been notified. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please login again to continue.',
  FORBIDDEN: 'You do not have permission to access this resource. Please contact support if you believe this is an error.',
  NOT_FOUND: 'The requested resource was not found. Please check the URL and try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'The request timed out. Please check your internet connection and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  MAINTENANCE: 'The service is currently under maintenance. Please try again later.',
  DEFAULT: 'An unexpected error occurred. Please try again.',
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
