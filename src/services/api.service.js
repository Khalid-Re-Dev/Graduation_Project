import axios from 'axios';
import { API_BASE_URL, DEFAULT_HEADERS, ERROR_MESSAGES, REQUEST_TIMEOUT } from '../config/api.config';

/**
 * Base API service for handling HTTP requests
 */
class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: DEFAULT_HEADERS,
      timeout: REQUEST_TIMEOUT,
    });

    // Keep track of pending requests
    this.pendingRequests = new Map();

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle token refresh here if needed
        if (error.response?.status === 401 && !this.isPublicEndpoint(error.config.url)) {
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Optionally redirect to login
          window.location.href = '/login';
        }
        if (error.message && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
          alert('Network error: Unable to reach the server. Please check your connection.');
        }
        return Promise.reject(error);
      }
    );

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Don't add auth header for public endpoints
        if (this.isPublicEndpoint(config.url)) {
          console.log('Skipping auth header for public endpoint:', config.url);
          // Ensure we remove any existing auth header
          delete config.headers.Authorization;
          return config;
        }

        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // List of endpoints that don't require authentication
  isPublicEndpoint(url) {
    const publicPaths = [
      '/products/',
      '/products/new/',
      '/products/popular/',
      '/products/featured/',
      '/products/search/',
      '/categories/',
      '/auth/login/',
      '/auth/register/',
    ];
    // لا تعتبر أي endpoint فيها /reaction/ أو /favorites/ أو /reviews/create/ عامة
    const path = url?.replace(API_BASE_URL, '');
    const cleanPath = path?.split('?')[0];
    if (cleanPath?.includes('/reaction/') || cleanPath?.includes('/favorites/') || cleanPath?.includes('/reviews/create/')) {
      return false;
    }
    // First try exact match
    if (publicPaths.includes(cleanPath)) {
      console.log(`Exact match - endpoint ${cleanPath} is public`);
      return true;
    }
    // Then try checking if it starts with any of the public paths
    const isPublic = publicPaths.some(endpoint => cleanPath?.startsWith(endpoint));
    console.log(`Checking endpoint ${cleanPath} (from ${url}) - Public:`, isPublic);
    return isPublic;
  }

  // Generate a unique key for a request
  getRequestKey(endpoint, params = {}, method = 'GET') {
    return `${method}:${endpoint}:${JSON.stringify(params)}`;
  }

  // Get or create a request promise
  async getOrCreateRequest(key, requestFn) {
    // If there's already a pending request for this key, return it
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create a new request promise
    const requestPromise = requestFn().finally(() => {
      // Remove the request from pending requests when it completes
      this.pendingRequests.delete(key);
    });

    // Store the request promise
    this.pendingRequests.set(key, requestPromise);

    return requestPromise;
  }

  /**
   * Handle the response from the server
   * @param {Response} response - The response from the server
   * @returns {Promise} - The parsed response data
   * @throws {Error} - If the response is not successful
   */
  async handleResponse(response) {
    try {
      // Log API response for debugging
      console.log('API Response:', response.status, response.headers['content-type'], 'URL:', response.config.url);
      
      // Parse response data
      const data = response.data;
      console.log('Raw API response:', typeof data, data);
      
      if (response.status >= 200 && response.status < 300) {
        return data;
      }
      
      throw new Error(data.message || data.detail || ERROR_MESSAGES.SERVER_ERROR);
    } catch (error) {
      console.log('Error handling API response:', error);
      throw error;
    }
  }

  /**
   * Make a GET request
   * @param {string} endpoint - The endpoint to make the request to
   * @param {Object} params - Query parameters
   * @returns {Promise} - The response from the server
   */
  async get(endpoint, params = {}) {
    const requestKey = this.getRequestKey(endpoint, params, 'GET');
    
    return this.getOrCreateRequest(requestKey, async () => {
      try {
        // For public endpoints, use the client but ensure no auth header
        if (this.isPublicEndpoint(endpoint)) {
          console.log('Making public request to:', endpoint);
          const publicConfig = {
            headers: { ...DEFAULT_HEADERS }
          };
          delete publicConfig.headers.Authorization;
          console.log('Public request config:', publicConfig);
          const response = await this.client.get(endpoint, { params, ...publicConfig });
          return this.handleResponse(response);
        }

        // For protected endpoints, use the authenticated client
        const response = await this.client.get(endpoint, { params });
        console.log('Protected request headers:', response.config.headers);
        return this.handleResponse(response);
      } catch (error) {
        console.error(`Error making request to ${endpoint}:`, error.response?.status, error.response?.data);
        throw error;
      }
    });
  }

  /**
   * Make a POST request
   * @param {string} endpoint - The endpoint to make the request to
   * @param {Object} data - The data to send
   * @returns {Promise} - The response from the server
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return this.handleResponse(response);
    } catch (error) {
      if (error.response?.status === 401 && this.isPublicEndpoint(endpoint)) {
        // For public endpoints (like login), try without auth header
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
          headers: DEFAULT_HEADERS,
          timeout: REQUEST_TIMEOUT
        });
        return this.handleResponse(response);
      }
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - The endpoint to make the request to
   * @param {Object|FormData} data - The data to send
   * @returns {Promise} - The response from the server
   */
  async put(endpoint, data = {}) {
    const response = await this.client.put(endpoint, data);
    return this.handleResponse(response);
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - The endpoint to make the request to
   * @returns {Promise} - The response from the server
   */
  async delete(endpoint) {
    const response = await this.client.delete(endpoint);
    return this.handleResponse(response);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
