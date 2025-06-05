import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { productService } from "../services/product.service"

const {
  getProducts,
  getProductDetails,
  getFeaturedProducts,
  getPopularProducts,
  getNewProducts
} = productService

// Async thunk for fetching all products
export const fetchAllProducts = createAsyncThunk("products/fetchAll", async (_, { rejectWithValue }) => {
  try {
    console.log("Fetching all products...")
    const data = await getProducts()

    // Validate the response data
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format received from API:", data)
      return rejectWithValue("Invalid data format received from API")
    }

    console.log(`Successfully fetched ${data.length} products`)
    return data
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return rejectWithValue(error.message || "Failed to fetch products")
  }
})

// Async thunk for fetching new products
export const fetchNewProducts = createAsyncThunk("products/fetchNew", async (_, { rejectWithValue, getState }) => {
  try {
    console.log("Fetching new products...")

    // Try to get new products from the API (which now uses a fallback strategy)
    const data = await getNewProducts(10)

    // Validate the response data
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format received from API for new products:", data)

      // Check if we already have all products in the store
      const { allProducts } = getState().products
      if (allProducts && allProducts.length > 0) {
        console.log("Using existing products from store to create new products list")
        // Sort by creation date to get newest products
        const sortedProducts = [...allProducts].sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA
        })
        return sortedProducts.slice(0, 10)
      }

      return rejectWithValue("Invalid data format received from API")
    }

    console.log(`Successfully fetched ${data.length} new products`)
    return data
  } catch (error) {
    console.error("Failed to fetch new products:", error)

    // Check if we already have all products in the store
    const { allProducts } = getState().products
    if (allProducts && allProducts.length > 0) {
      console.log("Using existing products from store to create new products list")
      // Sort by creation date to get newest products
      const sortedProducts = [...allProducts].sort((a, b) => {
        const dateA = new Date(a.created_at || 0)
        const dateB = new Date(b.created_at || 0)
        return dateB - dateA
      })
      return sortedProducts.slice(0, 10)
    }

    return rejectWithValue(error.message || "Failed to fetch new products")
  }
})

// Async thunk for fetching popular products
export const fetchPopularProducts = createAsyncThunk("products/fetchPopular", async (_, { rejectWithValue, getState }) => {
  try {
    console.log("Fetching popular products...")
    const data = await getPopularProducts(10)

    // Validate the response data
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format received from API for popular products:", data)

      // Check if we already have all products in the store
      const { allProducts } = getState().products
      if (allProducts && allProducts.length > 0) {
        console.log("Using existing products from store to create popular products list")
        // Sort by popularity to get most popular products
        const sortedProducts = [...allProducts].sort((a, b) => {
          const popularityA = a.popularity || a.likes || 0
          const popularityB = b.popularity || b.likes || 0
          return popularityB - popularityA
        })
        return sortedProducts.slice(0, 10)
      }

      return rejectWithValue("Invalid data format received from API")
    }

    console.log(`Successfully fetched ${data.length} popular products`)
    return data
  } catch (error) {
    console.error("Failed to fetch popular products:", error)

    // Check if we already have all products in the store
    const { allProducts } = getState().products
    if (allProducts && allProducts.length > 0) {
      console.log("Using existing products from store to create popular products list")
      // Sort by popularity to get most popular products
      const sortedProducts = [...allProducts].sort((a, b) => {
        const popularityA = a.popularity || a.likes || 0
        const popularityB = b.popularity || b.likes || 0
        return popularityB - popularityA
      })
      return sortedProducts.slice(0, 10)
    }

    return rejectWithValue(error.message || "Failed to fetch popular products")
  }
})

// Async thunk for fetching a single product by ID
export const fetchProductById = createAsyncThunk("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    console.log(`Fetching product details for ID ${id}...`)
    const productData = await getProductDetails(id)

    // Validate the response data
    if (!productData) {
      console.error("Invalid data format received from API for product details:", productData)
      return rejectWithValue("Invalid data format received from API")
    }

    // Ensure we have a consistent structure for the component
    const result = {
      product: productData.product || productData,
      relatedProducts: productData.relatedProducts || []
    }

    // Additional validation for product object
    if (!result.product || typeof result.product !== 'object') {
      console.error("Invalid product object in response:", result.product)
      return rejectWithValue("Invalid product data received from API")
    }

    console.log(`Successfully fetched product details for ID ${id}`)
    return result
  } catch (error) {
    console.error(`Failed to fetch product details for ID ${id}:`, error)
    return rejectWithValue(error.message || `Failed to fetch product details for ID ${id}`)
  }
})

// Product slice with reducers and actions
const productSlice = createSlice({
  name: "products",
  initialState: {
    allProducts: [],
    newProducts: [],
    popularProducts: [],
    currentProduct: null,
    relatedProducts: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Add a review to a product
    addReview: (state, action) => {
      const { productId, review } = action.payload

      // Find the product in all product arrays
      const updateProductInArray = (array) => {
        return array.map((product) => {
          if (product.id === productId) {
            return {
              ...product,
              reviews: [...(product.reviews || []), review],
            }
          }
          return product
        })
      }

      // Update in all arrays
      state.allProducts = updateProductInArray(state.allProducts)
      state.newProducts = updateProductInArray(state.newProducts)
      state.popularProducts = updateProductInArray(state.popularProducts)

      // Update current product if it's the one being reviewed
      if (state.currentProduct && state.currentProduct.id === productId) {
        state.currentProduct = {
          ...state.currentProduct,
          reviews: [...(state.currentProduct.reviews || []), review],
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllProducts
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false
        state.error = null

        // Log the received payload for debugging
        console.log("Received products payload:", action.payload);

        // Handle different API response formats
        let products = [];

        if (Array.isArray(action.payload)) {
          // Direct array format
          products = action.payload;
        } else if (action.payload && typeof action.payload === 'object') {
          // Object with results property (common API format)
          if (Array.isArray(action.payload.results)) {
            products = action.payload.results;
          } else if (Array.isArray(action.payload.products)) {
            products = action.payload.products;
          } else if (Array.isArray(action.payload.data)) {
            products = action.payload.data;
          } else {
            // If no recognizable array property, return the object itself
            products = [action.payload];
          }
        }

        // Filter out any invalid product objects and non-product objects
        products = products.filter(p => {
          // Must be an object
          if (!p || typeof p !== 'object') return false;

          // Filter out category objects (have product_count)
          if ('product_count' in p) {
            console.warn('🚫 Filtering out category object:', p.name);
            return false;
          }

          // Filter out shop objects (have owner_name or completion_percentage)
          if ('owner_name' in p || 'completion_percentage' in p) {
            console.warn('🚫 Filtering out shop object:', p.name);
            return false;
          }

          // Filter out brand objects (have popularity, rating, likes, dislikes)
          if ('popularity' in p && 'rating' in p && 'likes' in p && 'dislikes' in p) {
            console.warn('🚫 Filtering out brand object:', p.name);
            return false;
          }

          // Must have id or name to be considered a product
          return (p.id || p.name);
        });

        if (products.length === 0) {
          console.error("No valid products found in API response:", action.payload);
        }

        // Ensure each product has required properties
        products = products.map(product => ({
          id: product.id || Math.random().toString(36).substring(2, 11),
          name: product.name || 'Unnamed Product',
          price: product.price || 0,
          image: product.image || product.image_url || product.thumbnail || "https://via.placeholder.com/300x300?text=Product+Image",
          category: product.category || product.category_name || 'Uncategorized',
          ...product // Keep all original properties
        }));

        console.log(`Processed ${products.length} products`, products);
        state.allProducts = products;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch products"
        console.error("❌ Failed to fetch products from API:", action.payload)
        // Clear products array to show empty state when API fails
        state.allProducts = []
      })

      // Handle fetchNewProducts
      .addCase(fetchNewProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Ensure we have an array, even if the API returns null or undefined
        state.newProducts = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchNewProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch new products"
        console.error("❌ Failed to fetch new products from API:", action.payload)
        // Clear new products array to show empty state when API fails
        state.newProducts = []
      })

      // Handle fetchPopularProducts
      .addCase(fetchPopularProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Ensure we have an array, even if the API returns null or undefined
        state.popularProducts = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchPopularProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch popular products"
        console.error("❌ Failed to fetch popular products from API:", action.payload)
        // Clear popular products array to show empty state when API fails
        state.popularProducts = []
      })

      // Handle fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.currentProduct = action.payload.product
        state.relatedProducts = Array.isArray(action.payload.relatedProducts)
          ? action.payload.relatedProducts
          : []
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch product details"
        console.error("❌ Failed to fetch product details from API:", action.payload)

        // Clear current product and related products to show error state
        state.currentProduct = null
        state.relatedProducts = []
      })
  },
})

export const { addReview } = productSlice.actions
export default productSlice.reducer
