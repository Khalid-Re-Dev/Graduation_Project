/**
 * Mock product data and functions for fallback when API is unavailable
 * This file is now deprecated for production. Do not import or use in production code.
 */

// Mock product data
export const mockProducts = [
  
];

/**
 * Fetch mock products with optional filtering
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - Resolves with filtered products
 */
export const fetchProducts = async (params = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProducts = [...mockProducts];
  
  // Apply sorting if specified
  if (params.sort) {
    const order = params.order === 'desc' ? -1 : 1;
    filteredProducts.sort((a, b) => {
      if (params.sort === 'created_at') {
        return order * (new Date(b.created_at) - new Date(a.created_at));
      }
      if (params.sort === 'popularity') {
        return order * (b.popularity - a.popularity);
      }
      if (params.sort === 'price') {
        return order * (a.price - b.price);
      }
      return 0;
    });
  }
  
  // Apply category filter if specified
  if (params.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category.toLowerCase() === params.category.toLowerCase()
    );
  }
  
  return filteredProducts;
};

/**
 * Fetch mock product details by ID
 * @param {string|number} productId - Product ID to fetch
 * @returns {Promise} - Resolves with product details and related products
 */
export const fetchProductDetails = async (productId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const id = parseInt(productId, 10);
  const product = mockProducts.find(p => p.id === id);
  
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  // Get related products (same category)
  const relatedProducts = mockProducts
    .filter(p => p.category === product.category && p.id !== id)
    .slice(0, 4);
  
  return {
    product,
    relatedProducts
  };
};
