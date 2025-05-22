import { API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';

// Local storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

/**
 * Authentication service
 */
class AuthService {
  /**
   * Login user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise} - The response from the server
   */
  async login(credentials) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.access && response.refresh) {
        // Store tokens and user data
        this.setTokens(response.access, response.refresh);
        this.setUser(response.user);
        return response;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Register user
   * @param {Object} userData - User registration data
   * @returns {Promise} - The response from the server
   */
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Logout user
   * @returns {Promise} - The response from the server
   */
  async logout() {
    try {
      // Call logout endpoint if needed
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user data regardless of API response
      this.clearTokens();
    }
  }
  
  /**
   * Refresh access token using refresh token
   * @returns {Promise} - The response from the server
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refresh: refreshToken
      });
      
      if (response.access) {
        // Update access token
        localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
        return response.access;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh error
      this.clearTokens();
      throw error;
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }
  
  /**
   * Get access token
   * @returns {string|null} - Access token or null if not available
   */
  getToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  
  /**
   * Get refresh token
   * @returns {string|null} - Refresh token or null if not available
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  
  /**
   * Get user data
   * @returns {Object|null} - User data or null if not available
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  
  /**
   * Set tokens in local storage
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  
  /**
   * Set user data in local storage
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  
  /**
   * Clear tokens and user data from local storage
   */
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  
  /**
   * Check if user is admin
   * @returns {boolean} - True if user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user && (user.is_admin || user.user_type === 'admin');
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export individual functions for easier imports
export const login = (credentials) => authService.login(credentials);
export const register = (userData) => authService.register(userData);
export const logout = () => authService.logout();
export const isAuthenticated = () => authService.isAuthenticated();
export const getToken = () => authService.getToken();
export const getUser = () => authService.getUser();
export const isAdmin = () => authService.isAdmin();
export const clearTokens = () => authService.clearTokens();
