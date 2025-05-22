import { API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';
// Import mock data functions for fallback
import { fetchProducts as fetchMockProducts, fetchProductDetails as fetchMockProductDetails } from './productService';

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
        console.log(`Fetching products from API: ${url}`);
        const apiData = await apiService.get(url);

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

        if (products && products.length > 0) {
          console.log('Successfully processed products from API:', products.length);
          return products;
        } else {
          console.warn('API returned empty or invalid data, using mock data instead');
          // If API returned empty data, use mock data
          return await fetchMockProducts(params);
        }
      } catch (apiError) {
        console.warn('API request failed, using mock data instead:', apiError);
        // If API request failed, use mock data
        return await fetchMockProducts(params);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // As a last resort, return mock data
      return await fetchMockProducts(params);
    }
  }

  /**
   * Get product details
   * @param {string} productId - Product ID
   * @returns {Promise} - Product details
   */
  async getProductDetails(productId) {
    try {
      try {
        // First try to get data from the API
        const apiData = await apiService.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));

        // Check if the API returned valid data
        if (apiData && (apiData.id || (apiData.product && apiData.product.id))) {
          console.log('Successfully fetched product details from API for ID:', productId);
          return apiData;
        } else {
          console.warn('API returned empty or invalid product details, using mock data instead');
          // If API returned empty data, use mock data
          return await fetchMockProductDetails(productId);
        }
      } catch (apiError) {
        console.warn(`API request failed for product ID ${productId}, using mock data instead:`, apiError);
        // If API request failed, use mock data
        return await fetchMockProductDetails(productId);
      }
    } catch (error) {
      console.error(`Error fetching product details for ID ${productId}:`, error);
      // As a last resort, return mock data
      return await fetchMockProductDetails(productId);
    }
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - Featured products data
   */
  async getFeaturedProducts(limit = 10) {
    try {
      try {
        // First try to get data from the API
        const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`);

        // Check if the API returned valid data
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          console.log('Successfully fetched featured products from API:', apiData.length);
          return apiData;
        } else {
          console.warn('API returned empty or invalid featured products, using mock data instead');
          // If API returned empty data, use mock data with a mix of popular and new products
          const mockData = await fetchMockProducts();
          // Sort by a combination of popularity and newness to simulate "featured"
          const sortedData = mockData.sort((a, b) => {
            const aScore = a.popularity * 0.7 + (new Date(a.created_at).getTime() * 0.3);
            const bScore = b.popularity * 0.7 + (new Date(b.created_at).getTime() * 0.3);
            return bScore - aScore;
          });
          return sortedData.slice(0, limit);
        }
      } catch (apiError) {
        console.warn('API request failed for featured products, using mock data instead:', apiError);
        // If API request failed, use mock data
        const mockData = await fetchMockProducts();
        // Sort by a combination of popularity and newness to simulate "featured"
        const sortedData = mockData.sort((a, b) => {
          const aScore = a.popularity * 0.7 + (new Date(a.created_at).getTime() * 0.3);
          const bScore = b.popularity * 0.7 + (new Date(b.created_at).getTime() * 0.3);
          return bScore - aScore;
        });
        return sortedData.slice(0, limit);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // As a last resort, return mock data
      const mockData = await fetchMockProducts();
      // Sort by a combination of popularity and newness to simulate "featured"
      const sortedData = mockData.sort((a, b) => {
        const aScore = a.popularity * 0.7 + (new Date(a.created_at).getTime() * 0.3);
        const bScore = b.popularity * 0.7 + (new Date(b.created_at).getTime() * 0.3);
        return bScore - aScore;
      });
      return sortedData.slice(0, limit);
    }
  }

  /**
   * Get popular products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - Popular products data
   */
  async getPopularProducts(limit = 10) {
    try {
      try {
        // First try to get data from the API
        const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.POPULAR}?limit=${limit}`);

        // Check if the API returned valid data
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          console.log('Successfully fetched popular products from API:', apiData.length);
          return apiData;
        } else {
          console.warn('API returned empty or invalid popular products, using mock data instead');
          // If API returned empty data, use mock data with sorting for popular products
          const mockData = await fetchMockProducts({ sort: "popularity", order: "desc" });
          return mockData.slice(0, limit);
        }
      } catch (apiError) {
        console.warn('API request failed for popular products, using mock data instead:', apiError);
        // If API request failed, use mock data
        const mockData = await fetchMockProducts({ sort: "popularity", order: "desc" });
        return mockData.slice(0, limit);
      }
    } catch (error) {
      console.error('Error fetching popular products:', error);
      // As a last resort, return mock data
      const mockData = await fetchMockProducts({ sort: "popularity", order: "desc" });
      return mockData.slice(0, limit);
    }
  }

  /**
   * Get new products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} - New products data
   */
  async getNewProducts(limit = 10) {
    try {
      console.log('Attempting to fetch new products from API...');

      // Since the /api/products/new/ endpoint is returning 404, we'll use a different approach
      // Instead of trying to use the specific endpoint, we'll get all products and sort them by date
      try {
        // First try to get all products from the API
        const allProducts = await this.getProducts();

        // Check if the API returned valid data
        if (allProducts && Array.isArray(allProducts) && allProducts.length > 0) {
          console.log('Successfully fetched all products, filtering for new products');

          // Sort products by creation date to get the newest ones
          const sortedProducts = [...allProducts].sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });

          console.log(`Returning ${Math.min(limit, sortedProducts.length)} new products`);
          return sortedProducts.slice(0, limit);
        } else {
          console.warn('API returned empty or invalid products, using mock data instead');
          // If API returned empty data, use mock data with sorting for new products
          const mockData = await fetchMockProducts({ sort: "created_at", order: "desc" });
          return mockData.slice(0, limit);
        }
      } catch (apiError) {
        console.warn('API request failed for products, using mock data instead:', apiError);
        // If API request failed, use mock data
        const mockData = await fetchMockProducts({ sort: "created_at", order: "desc" });
        return mockData.slice(0, limit);
      }
    } catch (error) {
      console.error('Error fetching new products:', error);
      // As a last resort, return mock data
      const mockData = await fetchMockProducts({ sort: "created_at", order: "desc" });
      return mockData.slice(0, limit);
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
