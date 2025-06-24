import { API_ENDPOINTS, API_BASE_URL } from '../config/api.config';
import { apiService } from './api.service';

/**
 * Product service for handling product-related API requests
 */
class ProductService {
  /**
   * Get all products
   * @param {Object} params - Query parameters (page, limit, sort, etc.)
   * @returns {Promise} - Products data
   */
  async getProducts(params = {}) {
    // Convert params object to query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      : API_ENDPOINTS.PRODUCTS.LIST;

    // استخدم التوكن دائماً مع المنتجات العامة
    const apiData = await apiService.get(url, { withAuth: true });

    // Log the raw API response for debugging
    console.log('Raw API response:', typeof apiData, apiData);

    // Handle different API response formats
    let products = [];

    if (Array.isArray(apiData)) {
      // Direct array format
      products = apiData;
    } else if (apiData && typeof apiData === 'object') {
      // Object with results property (common API format)
      if (Array.isArray(apiData.results)) {
        products = apiData.results;
      } else if (Array.isArray(apiData.products)) {
        products = apiData.products;
      } else if (Array.isArray(apiData.data)) {
        products = apiData.data;
      } else {
        // If no recognizable array property, return the object itself
        // This might be the case if the API returns a single product
        products = [apiData];
      }
    }

    return products;
  }

  /**
   * Get product details
   * @param {string} productId - Product ID
   * @returns {Promise} - Product details
   */
  async getProductDetails(productId) {
    const apiData = await apiService.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId), { withAuth: false });

    // Check if the API returned valid data
    if (apiData && (apiData.id || (apiData.product && apiData.product.id))) {
      return apiData;
    }

    throw new Error('Invalid product details from API');
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - Featured products data
   */
  async getFeaturedProducts(limit = 10) {
    const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`, { withAuth: false });

    // Check if the API returned valid data
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      return apiData;
    }

    throw new Error('Invalid featured products from API');
  }

  /**
   * Get popular products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - Popular products data
   */
  async getPopularProducts(limit = 10) {
    const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.POPULAR}?limit=${limit}`, { withAuth: false });

    // Check if the API returned valid data
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      return apiData;
    }

    throw new Error('Invalid popular products from API');
  }

  /**
   * Get new products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - New products data
   */
  async getNewProducts(limit = 10) {
    const allProducts = await this.getProducts();

    // Check if the API returned valid data
    if (allProducts && Array.isArray(allProducts) && allProducts.length > 0) {
      // Sort products by creation date to get the newest ones
      const sortedProducts = [...allProducts].sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      return sortedProducts.slice(0, limit);
    }

    throw new Error('Invalid new products from API');
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} - Search results
   */
  async searchProducts(query, params = {}) {
    // Convert params object to query string
    const queryParams = new URLSearchParams({ query, ...params });

    return await apiService.get(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams.toString()}`);
  }

  /**
   * Get product categories
   * @returns {Promise} - Categories data
   */
  async getCategories() {
    // استخدم المسار المطلق مباشرة لجلب التصنيفات
    return await apiService.get(API_ENDPOINTS.PRODUCTS.CATEGORIES, { absolute: true });
  }

  /**
   * Get product reviews (المسار الصحيح)
   */
  async getProductReviews(productId) {
    // جلب التقييمات: /api/products/<product_id>/reviews/
    return await apiService.get(`/products/${productId}/reviews/`);
  }
}

// Create and export a singleton instance
export const productService = new ProductService();

// Export individual functions for easier imports
export const getProducts = (params) => productService.getProducts(params);
export const getProductDetails = (productId) => productService.getProductDetails(productId);
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
