/**
 * API Configuration
 * This file contains the configuration for the API
 */

import { config } from './environment.config.js';

// Base URL for API requests (now environment-aware)
export const API_BASE_URL = config.API_BASE_URL;
 
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
    CATEGORIES: '/categories/',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile/',
    FAVORITES: '/user/favorites/',
    PREFERENCES: '/user/preferences/',
  },
  
  // Comparison endpoints
  COMPARISON: {
    LIST: '/comparison/',
    ADD: '/comparison/add/',
    REMOVE: '/comparison/remove/',
  },
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  TIMEOUT: 'Request timeout. Please try again later.',
};
