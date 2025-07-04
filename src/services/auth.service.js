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
   * @param {Object} credentials - User credentials (email, password, rememberMe)
   * @returns {Promise} - The response from the server
   */
  async login(credentials) {
    try {
      // فصل rememberMe عن بيانات الإرسال
      const { rememberMe, ...loginData } = credentials;
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
      if (response.access && response.refresh) {
        // Store tokens and user data
        this.setTokens(response.access, response.refresh, rememberMe);
        this.setUser(response.user, rememberMe);
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
    const refreshToken = this.getRefreshToken();
    try {
      // Only call logout endpoint if refresh token exists
      if (refreshToken) {
        await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw the error, just log it since we want to clear tokens regardless
    } finally {
      // Always clear tokens and user data
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
   * Get access token from either storage
   * @returns {string|null}
   */
  getToken() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
    console.log('auth.service.js getToken:', token); // تتبع التوكن
    return token;
  }
  
  /**
   * Get refresh token from either storage
   * @returns {string|null}
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }
  
  /**
   * Get user data from either storage
   * @returns {Object|null}
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  
  /**
   * Set tokens in local storage or session storage
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   * @param {boolean} rememberMe - If true, use localStorage; else sessionStorage
   */
  setTokens(accessToken, refreshToken, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    // Remove from the other storage to avoid conflict
    (rememberMe ? sessionStorage : localStorage).removeItem(ACCESS_TOKEN_KEY);
    (rememberMe ? sessionStorage : localStorage).removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set user data in local storage or session storage
   * @param {Object} user - User data
   * @param {boolean} rememberMe - If true, use localStorage; else sessionStorage
   */
  setUser(user, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
    (rememberMe ? sessionStorage : localStorage).removeItem(USER_KEY);
  }
  
  /**
   * Clear tokens and user data from both storages
   */
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
  
  /**
   * Check if user is admin
   * @returns {boolean} - True if user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user && (user.is_admin || user.user_type === 'admin');
  }
  
  /**
   * Check if current user is owner
   * @returns {boolean}
   */
  isOwner() {
    const user = this.getUser();
    return user && user.user_type === "owner";
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
export const isOwner = () => authService.isOwner();
export const clearTokens = () => authService.clearTokens();
