/**
 * Mock product data and functions for fallback when API is unavailable
 */

// Mock product data
export const mockProducts = [
  {
    id: 1,
    name: "Smartphone X Pro",
    price: 999.99,
    description: "The latest flagship smartphone with advanced features.",
    image: "https://via.placeholder.com/300x300?text=Smartphone+X+Pro",
    category: "Phones",
    stock: 15,
    popularity: 95,
    created_at: "2023-04-15T10:30:00Z",
    is_active: true,
    reviews: [
      { id: 1, rating: 5, comment: "Excellent phone, very fast!" },
      { id: 2, rating: 4, comment: "Great camera quality." }
    ]
  },
  {
    id: 2,
    name: "Laptop Ultra",
    price: 1299.99,
    description: "Powerful laptop for professionals and gamers.",
    image: "https://via.placeholder.com/300x300?text=Laptop+Ultra",
    category: "Computers",
    stock: 8,
    popularity: 88,
    created_at: "2023-03-20T14:45:00Z",
    is_active: true,
    reviews: [
      { id: 3, rating: 5, comment: "Perfect for my work needs." },
      { id: 4, rating: 5, comment: "Excellent performance for gaming." }
    ]
  },
  {
    id: 3,
    name: "Wireless Headphones",
    price: 199.99,
    description: "Premium noise-cancelling wireless headphones.",
    image: "https://via.placeholder.com/300x300?text=Wireless+Headphones",
    category: "HeadPhones",
    stock: 20,
    popularity: 92,
    created_at: "2023-05-05T09:15:00Z",
    is_active: true,
    reviews: [
      { id: 5, rating: 4, comment: "Great sound quality." }
    ]
  },
  {
    id: 4,
    name: "Smart Watch Series 5",
    price: 349.99,
    description: "Advanced smartwatch with health monitoring features.",
    image: "https://via.placeholder.com/300x300?text=Smart+Watch",
    category: "SmartWatch",
    stock: 12,
    popularity: 85,
    created_at: "2023-04-28T11:20:00Z",
    is_active: true,
    reviews: []
  },
  {
    id: 5,
    name: "4K Action Camera",
    price: 249.99,
    description: "Waterproof 4K action camera for adventures.",
    image: "https://via.placeholder.com/300x300?text=Action+Camera",
    category: "Camera",
    stock: 7,
    popularity: 78,
    created_at: "2023-02-15T16:30:00Z",
    is_active: true,
    reviews: [
      { id: 6, rating: 5, comment: "Amazing quality footage!" }
    ]
  },
  {
    id: 6,
    name: "Gaming Console Pro",
    price: 499.99,
    description: "Next-gen gaming console with 4K capabilities.",
    image: "https://via.placeholder.com/300x300?text=Gaming+Console",
    category: "Gaming",
    stock: 5,
    popularity: 97,
    created_at: "2023-05-10T08:45:00Z",
    is_active: true,
    reviews: [
      { id: 7, rating: 5, comment: "Best gaming experience ever!" }
    ]
  },
  {
    id: 7,
    name: "Tablet Air",
    price: 399.99,
    description: "Lightweight tablet with stunning display.",
    image: "https://via.placeholder.com/300x300?text=Tablet+Air",
    category: "Computers",
    stock: 10,
    popularity: 82,
    created_at: "2023-03-05T13:10:00Z",
    is_active: true,
    reviews: []
  },
  {
    id: 8,
    name: "Wireless Earbuds",
    price: 129.99,
    description: "True wireless earbuds with long battery life.",
    image: "https://via.placeholder.com/300x300?text=Wireless+Earbuds",
    category: "HeadPhones",
    stock: 25,
    popularity: 90,
    created_at: "2023-04-20T10:00:00Z",
    is_active: true,
    reviews: [
      { id: 8, rating: 4, comment: "Great sound, comfortable fit." }
    ]
  }
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
