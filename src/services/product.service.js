import { API_ENDPOINTS, ERROR_MESSAGES } from '../config/api.config';
import { apiService } from './api.service';

/**
 * Product service for handling product-related API requests
 */
class ProductService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.pendingRequests = new Map();
  }

  /**
   * Get cached data if available and not expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCacheData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache for a specific key or all cache if no key provided
   * @param {string} [key] - Optional cache key
   */
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get or create a request promise
   * @param {string} key - Request key
   * @param {Function} requestFn - Function to create the request
   * @returns {Promise} - Request promise
   */
  async getOrCreateRequest(key, requestFn) {
    // Check cache first
    const cachedData = this.getCachedData(key);
    if (cachedData) {
      return cachedData;
    }

    // If there's already a pending request for this key, return it
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create a new request promise
    const requestPromise = requestFn().then(data => {
      this.setCacheData(key, data);
      return data;
    }).finally(() => {
      // Remove the request from pending requests when it completes
      this.pendingRequests.delete(key);
    });

    // Store the request promise
    this.pendingRequests.set(key, requestPromise);

    return requestPromise;
  }

  /**
   * Fetch all products with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - Array of products
   */
  async getAllProducts(params = {}) {
    const key = `products:all:${JSON.stringify(params)}`;
    return this.getOrCreateRequest(key, async () => {
      try {
        console.log('Fetching all products...');
        const response = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST, params);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch products:', error);
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        throw new Error(error.message || ERROR_MESSAGES.DEFAULT);
      }
    });
  }

  /**
   * Fetch new products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} - Array of new products
   */
  async getNewProducts(limit = 10) {
    try {
      // Get all products and sort them by date
      const allProducts = await this.getAllProducts();
      return [...allProducts]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch new products:', error);
      return [];
    }
  }

  /**
   * Fetch popular products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} - Array of popular products
   */
  async getPopularProducts(limit = 10) {
    try {
      // Get all products and sort them by rating/views
      const allProducts = await this.getAllProducts();
      return [...allProducts]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch popular products:', error);
      return [];
    }
  }

  /**
   * Fetch featured products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} - Array of featured products
   */
  async getFeaturedProducts(limit = 10) {
    try {
      const cacheKey = `products:featured:${limit}`;
      const cached = this.getCachedData(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await apiService.get(API_ENDPOINTS.PRODUCTS.FEATURED, { limit });
      const products = Array.isArray(response) ? response : [];
      
      this.setCacheData(cacheKey, products);
      return products;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      if (error.message?.includes('Unauthorized')) {
        return [];
      }
      throw new Error(error.message || ERROR_MESSAGES.DEFAULT);
    }
  }

  /**
   * Get product details by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} - Product details
   */
  async getProductById(id) {
    try {
      const cacheKey = `products:detail:${id}`;
      const cached = this.getCachedData(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await apiService.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
      
      if (response) {
        this.setCacheData(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw new Error(error.message || ERROR_MESSAGES.DEFAULT);
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<Array>} - Array of matching products
   */
  async searchProducts(query, params = {}) {
    try {
      const cacheKey = `products:search:${query}:${JSON.stringify(params)}`;
      const cached = this.getCachedData(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await apiService.get(API_ENDPOINTS.PRODUCTS.SEARCH, {
        ...params,
        q: query,
      });
      const products = Array.isArray(response) ? response : [];
      
      this.setCacheData(cacheKey, products);
      return products;
    } catch (error) {
      console.error('Failed to search products:', error);
      if (error.message?.includes('Unauthorized')) {
        return [];
      }
      throw new Error(error.message || ERROR_MESSAGES.DEFAULT);
    }
  }

  /**
   * Get product categories
   * @returns {Promise<Array>} - Array of categories
   */
  async getCategories() {
    try {
      const cacheKey = 'categories';
      const cached = this.getCachedData(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await apiService.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
      const categories = Array.isArray(response) ? response : [];
      
      this.setCacheData(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      if (error.message?.includes('Unauthorized')) {
        return [];
      }
      throw new Error(error.message || ERROR_MESSAGES.DEFAULT);
    }
  }

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @returns {Promise} - Array of reviews
   */
  async getProductReviews(productId) {
    return await apiService.get(`/products/${productId}/reviews/`);
  }

  /**
   * Add a review for a product
   * @param {string} productId - Product ID
   * @param {number} rating - Rating value (1-5)
   * @returns {Promise}
   */
  async addProductReview(productId, rating) {
    return await apiService.post(`/products/${productId}/reviews/create/`, { rating });
  }
}

// Create and export a singleton instance
export const productService = new ProductService();

// Export individual functions for easier imports
export const getAllProducts = (params) => productService.getAllProducts(params);
export const getProductById = (id) => productService.getProductById(id);
export const getFeaturedProducts = (limit) => productService.getFeaturedProducts(limit);
export const getPopularProducts = (limit) => productService.getPopularProducts(limit);
export const getNewProducts = (limit) => productService.getNewProducts(limit);
export const searchProducts = (query, params) => productService.searchProducts(query, params);
export const getCategories = () => productService.getCategories();
export const getProductReviews = (productId) => productService.getProductReviews(productId);

// طلب خاص للتصنيفات مع API_BASE_URL ثابت
export const getCategoriesDirect = async () => {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/categories/`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('فشل في جلب التصنيفات');
    return await response.json();
  } catch (err) {
    throw err;
  }
};

/**
 * Send a reaction (like/dislike/neutral) for a product
 * @param {string} productId
 * @param {string} reactionType - 'like' | 'dislike' | 'neutral'
 * @returns {Promise}
 */
export async function reactToProduct(productId, reactionType) {
  return apiService.request(`/products/${productId}/reaction/`, {
    method: 'POST',
    body: JSON.stringify({ reaction_type: reactionType }),
    headers: { 'Content-Type': 'application/json' },
    withAuth: true,
  });
}

export const addProductReview = (productId, rating) => productService.addProductReview(productId, rating);
