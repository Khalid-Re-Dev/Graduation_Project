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
    CATEGORIES: '/products/categories/',
    // Alternative endpoints in case the main ones don't work
    POPULAR_ALT: '/products/?ordering=-likes',
    FEATURED_ALT: '/products/?featured=true',
    NEW_ALT: '/products/?ordering=-created_at',
  },

  // User endpoints
  USER: {
    PROFILE: '/auth/profile/', // الصحيح حسب المسارات في Django
    FAVORITES: '/user/favorites/',
    PREFERENCES: '/user/preferences/',
  },

  // Comparison endpoints
  COMPARISON: {
    COMPARE: (productId) => `/comparison/${productId}/compare/`,
  },

  // Shop/Store endpoints
  SHOP: {
    CHECK: '/shop/check/',
    REGISTER: '/shop/create/', // الصحيح حسب المسارات في Django
    UPDATE: (id) => `/shop/${id}/update/`, // الصحيح حسب المسارات في Django
    DELETE: (id) => `/shop/${id}/delete/`, // الصحيح حسب المسارات في Django
  },

  // Brands endpoints
  BRANDS: {
    LIST: '/dashboard/brands/',
    CREATE: '/dashboard/brands/',
    UPDATE: (id) => `/dashboard/brands/${id}/`,
    DELETE: (id) => `/dashboard/brands/${id}/`,
  },
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 60000;

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