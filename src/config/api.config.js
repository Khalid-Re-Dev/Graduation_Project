// User endpoints (يجب إضافتها داخل تعريف API_ENDPOINTS وليس قبله)
/**
 * API Configuration
 * This file contains the configuration for the API
 */

// Base URL for API requests
export const API_BASE_URL = 'https://binc-b.onrender.com/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    USERS: '/auth/users/', // ViewSet: GET, POST, PUT/PATCH, DELETE
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH_TOKEN: '/auth/token/refresh/',
    VERIFY_TOKEN: '/auth/token/verify/',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile/',
    FAVORITES: '/user/favorites/',
    FAVORITES_TOGGLE: (productId) => `/user/favorites/${productId}/toggle/`,
    // أضف أي مسارات أخرى لازمة هنا
  },

  // Products endpoints
  PRODUCTS: {
    LIST: '/products/', // GET: قائمة المنتجات
    DETAIL: (id) => `/products/${id}/`, // GET: تفاصيل منتج
    CREATE: '/products/', // POST: إضافة منتج
    UPDATE: (id) => `/products/${id}/update/`, // PUT/PATCH: تحديث منتج
    DELETE: (id) => `/products/${id}/delete/`, // DELETE: حذف منتج
    BRANDS: '/products/brands/', // ViewSet: جميع عمليات البراندات
    REACTION: (id) => `/products/${id}/reaction/`, // تفاعل المستخدم مع منتج
    CATEGORIES: '/products/categories/', // جميع عمليات الفئات (GET, POST)
    CATEGORY_DETAIL: (id) => `/products/categories/${id}/`, // تفاصيل/تعديل/حذف فئة (GET, PUT, DELETE)
    POPULAR: '/products/popular/', // جلب المنتجات الأكثر شعبية
  },

  // Product Specifications endpoints
  PRODUCT_SPECIFICATIONS: {
    LIST: (productId) => `/dashboard/products/${productId}/specifications/`, // GET
    UPSERT: (productId) => `/dashboard/products/${productId}/specifications/`, // POST
    UPDATE: (productId, specId) => `/dashboard/products/${productId}/specifications/${specId}/`, // PUT
    DELETE: (productId, specId) => `/dashboard/products/${productId}/specifications/${specId}/`, // DELETE
  },

  // Reviews endpoints
  REVIEWS: {
    LIST: '/reviews/', // جلب كل المراجعات
    CREATE: '/reviews/', // إضافة مراجعة
    PRODUCT_REVIEWS: (productId) => `/reviews/products/${productId}/reviews/`, // جلب/إضافة مراجعات منتج
    PRODUCT_REVIEW_DETAIL: (productId, reviewId) => `/reviews/products/${productId}/reviews/${reviewId}/`, // تفاصيل/تعديل/حذف مراجعة
  },

  // Recommendations endpoints
  RECOMMENDATIONS: {
    BASE: '/recommendations/', // توصيات أساسية
    HYBRID: '/recommendations/hybrid/', // توصيات هجينة
    FOR_YOU: '/recommendations/foryou/', // توصيات للمستخدم
  },

  // Promotions endpoints
  PROMOTIONS: {
    LIST: '/promotions/promotions/', // جلب العروض
    DETAIL: (promotionId) => `/promotions/promotions/${promotionId}/`, // تفاصيل/تعديل/حذف عرض
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