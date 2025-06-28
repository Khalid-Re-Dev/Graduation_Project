import { API_BASE_URL } from '../config/api.config';
import { apiService } from './api.service';

/**
 * Owner service for handling owner-specific API requests
 */
class OwnerService {
  /**
   * Check if the authenticated user has a shop
   * @returns {Promise} - Shop data if exists
   */
  async checkShop() {
    try {
      return await apiService.get('/shop/check/');
    } catch (error) {
      // إذا كان الخطأ 404، اعتبر أنه لا يوجد متجر وأرجع null
      if (error.message && error.message.includes('404')) {
        return null;
      }
      console.error('Error checking shop:', error);
      throw error;
    }
  }

  /**
   * Register a new shop for the authenticated owner
   * @param {Object} shopData - Shop data
   * @returns {Promise} - Created shop data
   */
  async registerShop(shopData) {
    try {
      let dataToSend = shopData;
      // إذا لم يكن shopData من نوع FormData، حوله إلى FormData
      if (!(shopData instanceof FormData)) {
        dataToSend = new FormData();
        Object.entries(shopData).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            dataToSend.append(key, value);
          }
        });
      }
      // لا ترسل Content-Type مع FormData، دعه للمتصفح
      return await apiService.post('/shop/register/', dataToSend);
    } catch (error) {
      console.error('Error registering shop:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics for the owner's shop
   * @returns {Promise} - Dashboard statistics data
   */
  async getStats() {
    try {
      return await apiService.get('/dashboard/stats/');
    } catch (error) {
      console.error('Error fetching owner stats:', error);
      throw error;
    }
  }

  /**
   * Get products for the owner's shop
   * @param {Object} params - Query parameters (category, search, etc.)
   * @returns {Promise} - Products data
   */
  async getProducts(params = {}) {
    try {
      // Convert params object to query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const queryString = queryParams.toString();
      const url = queryString ? `/dashboard/products/?${queryString}` : '/dashboard/products/';

      return await apiService.get(url);
    } catch (error) {
      console.error('Error fetching owner products:', error);
      throw error;
    }
  }

  /**
   * Get a specific product from the owner's shop
   * @param {string} productId - Product ID
   * @returns {Promise} - Product data
   */
  async getProduct(productId) {
    try {
      return await apiService.get(`/dashboard/products/${productId}/`);
    } catch (error) {
      console.error(`Error fetching owner product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new product in the owner's shop
   * @param {Object} productData - Product data
   * @returns {Promise} - Created product data
   */
  async createProduct(productData) {
    try {
      let dataToSend = productData;
      // If productData is not already FormData, convert it
      if (!(productData instanceof FormData)) {
        dataToSend = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          // Add only non-null or non-empty values to FormData
          // This is crucial for file uploads and other data types
          if (value !== null && value !== '' && value !== undefined) {
            dataToSend.append(key, value);
          }
        });
      }

      // Log the FormData contents for debugging
      console.log('Creating product with FormData:');
      for (let [key, value] of dataToSend.entries()) {
        console.log(key, value);
      }

      return await apiService.post('/dashboard/products/', dataToSend);
    } catch (error) {
      console.error('Error creating product:', error);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    }
  }

  /**
   * Update a product in the owner's shop
   * @param {string} productId - Product ID
   * @param {Object|FormData} productData - Updated product data
   * @returns {Promise} - Updated product data
   */
  async updateProduct(productId, productData) {
    try {
      // Check if productData is FormData and use appropriate method
      const isFormData = productData instanceof FormData;

      if (isFormData) {
        // Log the FormData contents for debugging
        console.log('Updating product with FormData:');
        for (let [key, value] of productData.entries()) {
          console.log(key, value);
        }
        
        // For FormData, we need to use PATCH instead of PUT to handle partial updates properly
        return await apiService.patch(`/dashboard/products/${productId}/`, productData);
      } else {
        console.log('Updating product with JSON data:', productData);
        return await apiService.put(`/dashboard/products/${productId}/`, productData);
      }
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    }
  }

  /**
   * Delete a product from the owner's shop
   * @param {string} productId - Product ID
   * @returns {Promise} - Response from the server
   */
  async deleteProduct(productId) {
    try {
      return await apiService.delete(`/dashboard/products/${productId}/`);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get analytics data for the owner's shop
   * @returns {Promise} - Analytics data
   */
  async getAnalytics() {
    try {
      return await apiService.get('/dashboard/analytics/');
    } catch (error) {
      console.error('Error fetching owner analytics:', error);
      throw error;
    }
  }

  /**
   * Get shop settings
   * @returns {Promise} - Shop settings data
   */
  async getShopSettings() {
    try {
      return await apiService.get('/dashboard/settings/');
    } catch (error) {
      console.error('Error fetching shop settings:', error);
      throw error;
    }
  }

  /**
   * Update shop settings
   * @param {Object} settingsData - Updated shop settings
   * @returns {Promise} - Updated shop settings data
   */
  async updateShopSettings(settingsData) {
    try {
      return await apiService.put('/dashboard/settings/', settingsData);
    } catch (error) {
      console.error('Error updating shop settings:', error);
      throw error;
    }
  }

  /**
   * Get brands for the owner's shop
   * @returns {Promise} - Brands data
   */
  async getBrands() {
    try {
      return await apiService.get('/dashboard/brands/');
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Create a new brand
   * @param {Object} brandData - Brand data
   * @returns {Promise} - Created brand data
   */
  async createBrand(brandData) {
    try {
      return await apiService.post('/dashboard/brands/', brandData);
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const ownerService = new OwnerService();

// Export individual functions for easier imports
export const checkShop = () => ownerService.checkShop();
export const registerShop = (shopData) => ownerService.registerShop(shopData);
export const getOwnerStats = () => ownerService.getStats();
export const getOwnerProducts = (params) => ownerService.getProducts(params);
export const getOwnerProduct = (productId) => ownerService.getProduct(productId);
export const createOwnerProduct = (productData) => ownerService.createProduct(productData);
export const updateOwnerProduct = (productId, productData) => ownerService.updateProduct(productId, productData);
export const deleteOwnerProduct = (productId) => ownerService.deleteProduct(productId);
export const getOwnerAnalytics = () => ownerService.getAnalytics();
export const getShopSettings = () => ownerService.getShopSettings();
export const updateShopSettings = (settingsData) => ownerService.updateShopSettings(settingsData);
export const getOwnerBrands = () => ownerService.getBrands();
export const createOwnerBrand = (brandData) => ownerService.createBrand(brandData);
