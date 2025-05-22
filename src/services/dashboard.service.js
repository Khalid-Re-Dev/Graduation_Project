import { API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';

/**
 * Dashboard service for handling dashboard-related API requests
 */
class DashboardService {
  /**
   * Get dashboard statistics
   * @returns {Promise} - Dashboard statistics data
   */
  async getStats() {
    try {
      return await apiService.get(API_ENDPOINTS.DASHBOARD.STATS);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
  
  /**
   * Get products for dashboard
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
        ? `${API_ENDPOINTS.DASHBOARD.PRODUCTS}?${queryString}`
        : API_ENDPOINTS.DASHBOARD.PRODUCTS;
      
      return await apiService.get(url);
    } catch (error) {
      console.error('Error fetching dashboard products:', error);
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
      return await apiService.get(API_ENDPOINTS.DASHBOARD.PRODUCT_DETAIL(productId));
    } catch (error) {
      console.error(`Error fetching product details for ID ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise} - Created product data
   */
  async createProduct(productData) {
    try {
      return await apiService.post(API_ENDPOINTS.DASHBOARD.PRODUCTS, productData);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
  
  /**
   * Update a product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} - Updated product data
   */
  async updateProduct(productId, productData) {
    try {
      return await apiService.put(
        API_ENDPOINTS.DASHBOARD.PRODUCT_DETAIL(productId),
        productData
      );
    } catch (error) {
      console.error(`Error updating product ID ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise} - Response from the server
   */
  async deleteProduct(productId) {
    try {
      return await apiService.delete(API_ENDPOINTS.DASHBOARD.PRODUCT_DETAIL(productId));
    } catch (error) {
      console.error(`Error deleting product ID ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get analytics data
   * @param {Object} params - Query parameters (timeframe, metrics, etc.)
   * @returns {Promise} - Analytics data
   */
  async getAnalytics(params = {}) {
    try {
      // Convert params object to query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_ENDPOINTS.DASHBOARD.ANALYTICS}?${queryString}`
        : API_ENDPOINTS.DASHBOARD.ANALYTICS;
      
      return await apiService.get(url);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
  
  /**
   * Get shop settings
   * @returns {Promise} - Shop settings data
   */
  async getSettings() {
    try {
      return await apiService.get(API_ENDPOINTS.DASHBOARD.SETTINGS);
    } catch (error) {
      console.error('Error fetching shop settings:', error);
      throw error;
    }
  }
  
  /**
   * Update shop settings
   * @param {Object} settingsData - Updated settings data
   * @returns {Promise} - Updated settings data
   */
  async updateSettings(settingsData) {
    try {
      return await apiService.put(API_ENDPOINTS.DASHBOARD.SETTINGS, settingsData);
    } catch (error) {
      console.error('Error updating shop settings:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const dashboardService = new DashboardService();

// Export individual functions for easier imports
export const getStats = () => dashboardService.getStats();
export const getProducts = (params) => dashboardService.getProducts(params);
export const getProductDetails = (productId) => dashboardService.getProductDetails(productId);
export const createProduct = (productData) => dashboardService.createProduct(productData);
export const updateProduct = (productId, productData) => dashboardService.updateProduct(productId, productData);
export const deleteProduct = (productId) => dashboardService.deleteProduct(productId);
export const getAnalytics = (params) => dashboardService.getAnalytics(params);
export const getSettings = () => dashboardService.getSettings();
export const updateSettings = (settingsData) => dashboardService.updateSettings(settingsData);
