import { API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';

/**
 * User service for handling user-related API requests
 */
class UserService {
  /**
   * Get user profile
   * @returns {Promise} - User profile data
   */
  async getProfile() {
    try {
      return await apiService.get(API_ENDPOINTS.USER.PROFILE);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} - Updated profile data
   */
  async updateProfile(profileData) {
    try {
      return await apiService.put(API_ENDPOINTS.USER.PROFILE, profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Get user favorites
   * @returns {Promise} - User favorites data
   */
  async getFavorites() {
    try {
      return await apiService.get(API_ENDPOINTS.USER.FAVORITES);
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }
  
  /**
   * Add product to favorites
   * @param {string} productId - Product ID
   * @returns {Promise} - Response from the server
   */
  async addToFavorites(productId) {
    try {
      return await apiService.post(`${API_ENDPOINTS.USER.FAVORITES}`, { product_id: productId });
    } catch (error) {
      console.error(`Error adding product ID ${productId} to favorites:`, error);
      throw error;
    }
  }
  
  /**
   * Remove product from favorites
   * @param {string} productId - Product ID
   * @returns {Promise} - Response from the server
   */
  async removeFromFavorites(productId) {
    try {
      return await apiService.delete(`${API_ENDPOINTS.USER.FAVORITES}/${productId}`);
    } catch (error) {
      console.error(`Error removing product ID ${productId} from favorites:`, error);
      throw error;
    }
  }
  
  /**
   * Get user preferences
   * @returns {Promise} - User preferences data
   */
  async getPreferences() {
    try {
      return await apiService.get(API_ENDPOINTS.USER.PREFERENCES);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Update user preferences
   * @param {Object} preferencesData - Updated preferences data
   * @returns {Promise} - Updated preferences data
   */
  async updatePreferences(preferencesData) {
    try {
      return await apiService.put(API_ENDPOINTS.USER.PREFERENCES, preferencesData);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Get all users (admin only)
   * @param {Object} params - Query parameters (page, limit, sort, etc.)
   * @returns {Promise} - Users data
   */
  async getUsers(params = {}) {
    try {
      // Convert params object to query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `/admin/users?${queryString}`
        : '/admin/users';
      
      return await apiService.get(url);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const userService = new UserService();

// Export individual functions for easier imports
export const getProfile = () => userService.getProfile();
export const updateProfile = (profileData) => userService.updateProfile(profileData);
export const getFavorites = () => userService.getFavorites();
export const addToFavorites = (productId) => userService.addToFavorites(productId);
export const removeFromFavorites = (productId) => userService.removeFromFavorites(productId);
export const getPreferences = () => userService.getPreferences();
export const updatePreferences = (preferencesData) => userService.updatePreferences(preferencesData);
export const getUsers = (params) => userService.getUsers(params);
