import { API_ENDPOINTS } from '../config/api.config';
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
    try {
      // Convert params object to query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
        : API_ENDPOINTS.PRODUCTS.LIST;

      try {
        // First try to get data from the API
        console.log(`🔍 Fetching products from API: ${url}`);
        console.log(`🌐 Full URL: ${apiService.constructor.name}`, apiService);

        const apiData = await apiService.get(url);

        // Log the raw API response for debugging
        console.log('📦 Raw API response type:', typeof apiData);
        console.log('📦 Raw API response:', apiData);
        console.log('📦 Is array:', Array.isArray(apiData));

        // Handle different API response formats
        let products = [];

        if (Array.isArray(apiData)) {
          // Direct array format
          products = apiData;
          console.log('✅ Using direct array format');
        } else if (apiData && typeof apiData === 'object') {
          // Object with results property (common API format)
          if (Array.isArray(apiData.results)) {
            products = apiData.results;
            console.log('✅ Using paginated results format');
          } else if (Array.isArray(apiData.products)) {
            products = apiData.products;
            console.log('✅ Using products property format');
          } else if (Array.isArray(apiData.data)) {
            products = apiData.data;
            console.log('✅ Using data property format');
          } else if (apiData.success === false) {
            console.error('❌ API returned error:', apiData.error);
            throw new Error(apiData.error || 'API returned error response');
          } else {
            console.warn('⚠️ Unexpected API response structure');
            console.warn('⚠️ Available keys:', Object.keys(apiData));
            // Return empty array instead of treating single object as array
            products = [];
          }
        } else {
          console.warn('⚠️ API response is not an object or array');
          products = [];
        }

        console.log('🔄 Processed products count:', products.length);

        if (products && products.length > 0) {
          console.log('✅ Successfully processed products from API:', products.length);
          return products;
        } else {
          console.warn('⚠️ API returned empty data - this indicates the backend has no products or endpoint is not working');
          console.warn('⚠️ Returning empty array to show real API state (not using mock data)');
          return [];
        }
      } catch (apiError) {
        console.error('❌ API request failed:', apiError);
        console.error('❌ Error name:', apiError.name);
        console.error('❌ Error message:', apiError.message);

        // Don't fall back to mock data - throw the error so we can see what's wrong
        throw new Error(`Failed to fetch products from API: ${apiError.message}`);
      }
    } catch (error) {
      console.error('💥 Critical error in getProducts:', error);
      // Don't fall back to mock data - let the error bubble up
      throw error;
    }
  }

  /**
   * Get product details
   * @param {string} productId - Product ID
   * @returns {Promise} - Product details
   */
  async getProductDetails(productId) {
    try {
      console.log(`🔍 Fetching product details for ID: ${productId}`);
      const apiData = await apiService.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));

      console.log('📦 Product details API response:', apiData);

      // Check if the API returned valid data
      if (apiData && (apiData.id || (apiData.product && apiData.product.id))) {
        console.log('✅ Successfully fetched product details from API for ID:', productId);
        return apiData;
      } else {
        console.error('❌ API returned empty or invalid product details for ID:', productId);
        throw new Error(`Product with ID ${productId} not found or invalid data returned`);
      }
    } catch (error) {
      console.error(`💥 Failed to fetch product details for ID ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - Featured products data
   */
  async getFeaturedProducts(limit = 10) {
    try {
      console.log(`🔍 Fetching featured products with limit: ${limit}`);
      const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`);

      console.log('📦 Featured products API response:', apiData);

      // Handle different API response formats
      let products = [];
      if (Array.isArray(apiData)) {
        products = apiData;
      } else if (apiData && Array.isArray(apiData.results)) {
        products = apiData.results;
      } else if (apiData && Array.isArray(apiData.data)) {
        products = apiData.data;
      }

      console.log(`✅ Successfully fetched ${products.length} featured products from API`);
      return products;
    } catch (error) {
      console.error('💥 Failed to fetch featured products:', error);
      throw error;
    }
  }

  /**
   * Get popular products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - Popular products data
   */
  async getPopularProducts(limit = 10) {
    try {
      console.log(`🔍 Fetching popular products with limit: ${limit}`);
      const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.POPULAR}?limit=${limit}`);

      console.log('📦 Popular products API response:', apiData);

      // Handle different API response formats
      let products = [];
      if (Array.isArray(apiData)) {
        products = apiData;
      } else if (apiData && Array.isArray(apiData.results)) {
        products = apiData.results;
      } else if (apiData && Array.isArray(apiData.data)) {
        products = apiData.data;
      }

      console.log(`✅ Successfully fetched ${products.length} popular products from API`);
      return products;
    } catch (error) {
      console.error('💥 Failed to fetch popular products:', error);
      throw error;
    }
  }

  /**
   * Get new products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - New products data
   */
  async getNewProducts(limit = 10) {
    try {
      console.log(`🔍 Fetching new products with limit: ${limit}`);

      // Try the dedicated new products endpoint first
      try {
        const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.NEW}?limit=${limit}`);

        // Handle different API response formats
        let products = [];
        if (Array.isArray(apiData)) {
          products = apiData;
        } else if (apiData && Array.isArray(apiData.results)) {
          products = apiData.results;
        } else if (apiData && Array.isArray(apiData.data)) {
          products = apiData.data;
        }

        if (products.length > 0) {
          console.log(`✅ Successfully fetched ${products.length} new products from dedicated endpoint`);
          return products;
        }
      } catch (endpointError) {
        console.warn('⚠️ Dedicated new products endpoint failed, trying fallback approach:', endpointError.message);
      }

      // Fallback: Get all products and sort by creation date
      console.log('🔄 Using fallback: fetching all products and sorting by date');
      const allProducts = await this.getProducts();

      if (allProducts && Array.isArray(allProducts) && allProducts.length > 0) {
        // Sort products by creation date to get the newest ones
        const sortedProducts = [...allProducts].sort((a, b) => {
          const dateA = new Date(a.created_at || a.date_created || 0);
          const dateB = new Date(b.created_at || b.date_created || 0);
          return dateB - dateA;
        });

        const newProducts = sortedProducts.slice(0, limit);
        console.log(`✅ Successfully fetched ${newProducts.length} new products using fallback approach`);
        return newProducts;
      } else {
        console.error('❌ No products available from API');
        return [];
      }
    } catch (error) {
      console.error('💥 Failed to fetch new products:', error);
      throw error;
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} - Search results
   */
  async searchProducts(query, params = {}) {
    try {
      // Convert params object to query string
      const queryParams = new URLSearchParams({ query, ...params });

      return await apiService.get(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams.toString()}`);
    } catch (error) {
      console.error(`Error searching products with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get product categories
   * @returns {Promise} - Categories data
   */
  async getCategories() {
    try {
      return await apiService.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      throw error;
    }
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
