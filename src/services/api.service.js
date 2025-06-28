import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT, ERROR_MESSAGES } from '../config/api.config';
import { getToken, clearTokens } from './auth.service';
import { toast } from "react-toastify";

/**
 * Base API service for handling HTTP requests
 */
class ApiService {
  /**
   * Make an HTTP request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - The options for the request
   * @returns {Promise} - The response from the server
   */
  async request(url, options = {}) {
    const withAuth = options.withAuth !== false;
    // دعم المسارات المطلقة (absolute)
    const isAbsolute = options.absolute === true;
    const fullUrl = isAbsolute ? url : `${API_BASE_URL}${url}`;

    // Set default options
    const defaultOptions = {
      headers: this.getHeaders(withAuth),
      timeout: REQUEST_TIMEOUT,
    };

    // Merge default options with provided options
    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // إذا كان body من نوع FormData احذف Content-Type ليضبطه fetch تلقائياً
    if (requestOptions.body instanceof FormData && requestOptions.headers['Content-Type']) {
      delete requestOptions.headers['Content-Type'];
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      // Add signal to request options
      requestOptions.signal = controller.signal;

      // Check if backend is available (for development purposes)
      if (!navigator.onLine) {
        console.warn("Network is offline, using mock data if available");
        clearTimeout(timeoutId);
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      // Make the request
      const response = await fetch(fullUrl, requestOptions);

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle response
      return this.handleResponse(response);
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      return this.handleError(error);
    }
  }

  /**
   * Get request headers including authentication token if available
   * @returns {Object} - The headers for the request
   */
  getHeaders(withAuth = true) {
    const headers = { ...DEFAULT_HEADERS };
    if (withAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  /**
   * Handle the response from the server
   * @param {Response} response - The response from the server
   * @returns {Promise} - The parsed response data
   * @throws {Error} - If the response is not successful
   */
  async handleResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      // Log response details for debugging
      console.log(`API Response: ${response.status} ${response.statusText}`,
                  `Content-Type: ${contentType}`,
                  `URL: ${response.url}`);

      let data;
      try {
        // Try to parse the response based on content type
        data = isJson ? await response.json() : await response.text();
        console.log('Parsed API response data:', typeof data, data);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        // If parsing fails, return an empty object or array depending on the expected response
        return isJson ? {} : '';
      }

      if (!response.ok) {
        // Create error object with response data for better error handling
        const error = new Error();
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: data
        };

        // Handle different error status codes
        switch (response.status) {
          case 400:
            error.message = data.message || 'البيانات المرسلة غير صحيحة';
            break;
          case 401:
            // Only clear tokens if refresh token exists
            if (typeof localStorage !== 'undefined' && localStorage.getItem('refresh_token')) {
              clearTokens();
              toast.error('انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى.');
              // Redirect to login page if not already there
              if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                setTimeout(() => {
                  window.location.href = '/login';
                }, 1200);
              }
            }
            error.message = ERROR_MESSAGES.UNAUTHORIZED;
            break;
          case 403:
            error.message = ERROR_MESSAGES.FORBIDDEN;
            break;
          case 404:
            error.message = ERROR_MESSAGES.NOT_FOUND;
            break;
          case 422:
            error.message = data.message || ERROR_MESSAGES.VALIDATION_ERROR;
            break;
          case 500:
            error.message = ERROR_MESSAGES.SERVER_ERROR;
            break;
          default:
            error.message = data.message || `خطأ ${response.status}`;
        }
        
        throw error;
      }

      // If the response is empty but status is OK, return an empty array for endpoints that should return collections
      if ((!data || (typeof data === 'object' && Object.keys(data).length === 0)) &&
          (response.url.includes('/products') || response.url.includes('/categories'))) {
        console.warn('API returned empty data for a collection endpoint, returning empty array');
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error handling API response:', error);
      throw error;
    }
  }

  /**
   * Handle errors from the request
   * @param {Error} error - The error from the request
   * @param {Object} fallbackData - Optional fallback data to return instead of throwing
   * @returns {Object|null} - Fallback data or null
   * @throws {Error} - The error with a more descriptive message if no fallback provided
   */
  handleError(error, fallbackData = null) {
    if (error.name === 'AbortError') {
      console.warn(ERROR_MESSAGES.TIMEOUT);
      toast.error(ERROR_MESSAGES.TIMEOUT);

      if (fallbackData) return fallbackData;
      return { error: ERROR_MESSAGES.TIMEOUT, success: false };
    }

    if (!navigator.onLine) {
      console.warn(ERROR_MESSAGES.NETWORK_ERROR);
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);

      if (fallbackData) return fallbackData;
      return { error: ERROR_MESSAGES.NETWORK_ERROR, success: false };
    }

    const errorMessage = error.message || 'API Error';
    console.warn(`API Error: ${errorMessage}`);
    toast.error(errorMessage);

    if (fallbackData) return fallbackData;
    return { error: errorMessage, success: false };
  }

  /**
   * Make a GET request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - The options for the request
   * @returns {Promise} - The response from the server
   */
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   * @param {string} url - The URL to make the request to
   * @param {Object} data - The data to send with the request
   * @param {Object} options - The options for the request
   * @returns {Promise} - The response from the server
   */
  post(url, data, options = {}) {
    // إذا كان data من نوع FormData، أرسل body كما هو بدون تحويل إلى JSON
    const isFormData = data instanceof FormData;
    return this.request(url, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PUT request
   * @param {string} url - The URL to make the request to
   * @param {Object|FormData} data - The data to send with the request
   * @param {Object} options - The options for the request
   * @returns {Promise} - The response from the server
   */
  put(url, data, options = {}) {
    // Check if data is FormData
    const isFormData = data instanceof FormData;

    return this.request(url, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PATCH request
   * @param {string} url - The URL to make the request to
   * @param {Object|FormData} data - The data to send with the request
   * @param {Object} options - The options for the request
   * @returns {Promise} - The response from the server
   */
  patch(url, data, options = {}) {
    // Check if data is FormData
    const isFormData = data instanceof FormData;

    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a DELETE request
   * @param {string} url - The URL to make the request to
   * @param {Object} options - The options for the request
   * @returns {Promise} - The response from the server
   */
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
