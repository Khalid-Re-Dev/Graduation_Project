import { API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';
// Define the ProductService class
class ProductService {
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams}` : API_ENDPOINTS.PRODUCTS.LIST;
    const apiData = await apiService.get(url, { withAuth: false });

    if (Array.isArray(apiData)) return apiData;
    if (apiData && typeof apiData === 'object') {
      if (Array.isArray(apiData.results)) return apiData.results;
      if (Array.isArray(apiData.products)) return apiData.products;
      if (Array.isArray(apiData.data)) return apiData.data;
      return [apiData];
    }
    return [];
  }

  async getProductDetails(productId) {
    const apiData = await apiService.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId), { withAuth: false });
    if (apiData && (apiData.id || (apiData.product && apiData.product.id))) return apiData;
    throw new Error('Invalid product details from API');
  }

  async getFeaturedProducts(limit = 10) {
    const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`, { withAuth: false });
    if (Array.isArray(apiData) && apiData.length) return apiData;
    throw new Error('Invalid featured products from API');
  }

  async getPopularProducts(limit = 10) {
    const apiData = await apiService.get(`${API_ENDPOINTS.PRODUCTS.POPULAR}?limit=${limit}`, { withAuth: false });
    if (Array.isArray(apiData) && apiData.length) return apiData;
    throw new Error('Invalid popular products from API');
  }

  async getNewProducts(limit = 10) {
    const allProducts = await this.getProducts();
    if (Array.isArray(allProducts) && allProducts.length) {
      const sorted = [...allProducts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return sorted.slice(0, limit);
    }
    throw new Error('Invalid new products from API');
  }

  async searchProducts(query, params = {}) {
    const queryParams = new URLSearchParams({ query, ...params }).toString();
    return await apiService.get(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams}`, { withAuth: false });
  }

  async getCategories() {
    return await apiService.get(API_ENDPOINTS.PRODUCTS.CATEGORIES, { withAuth: false });
  }

  async getProductReviews(productId) {
    return await apiService.get(`/products/${productId}/reviews/`, { withAuth: false });
  }

  async addProductReview(productId, rating) {
    return await apiService.post(`/products/${productId}/reviews/create/`, { rating }, { withAuth: true });
  }
}

// Create a singleton instance of ProductService
const productService = new ProductService();

export const getProducts = (params) => productService.getProducts(params);
export const getProductDetails = (id) => productService.getProductDetails(id);
export const getFeaturedProducts = (limit) => productService.getFeaturedProducts(limit);
export const getPopularProducts = (limit) => productService.getPopularProducts(limit);
export const getNewProducts = (limit) => productService.getNewProducts(limit);
export const searchProducts = (query, params) => productService.searchProducts(query, params);
export const getCategories = () => productService.getCategories();
export const getProductReviews = (id) => productService.getProductReviews(id);
export const addProductReview = (id, rating) => productService.addProductReview(id, rating);
