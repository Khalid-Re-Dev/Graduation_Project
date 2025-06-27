import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit"
import { getProductById, getNewProducts, getPopularProducts } from "../services/product.service"
import { productService } from '../services/product.service'

// Memoized selectors
export const selectProducts = createSelector(
  [(state) => state.products],
  (products) => ({
    items: products.items || [],
    newProducts: products.newProducts || [],
    popularProducts: products.popularProducts || [],
    loading: products.loading,
    newProductsLoading: products.newProductsLoading,
    popularProductsLoading: products.popularProductsLoading,
    error: products.error,
    newProductsError: products.newProductsError,
    popularProductsError: products.popularProductsError
  })
)

// Async thunk for fetching all products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { getState }) => {
    // Check if we already have products and they're not being loaded
    const state = getState().products
    if (state.items?.length > 0 && !state.loading) {
      return state.items
    }
    console.log("Fetching all products...")
    const products = await productService.getAllProducts()
    return products
  }
)

// Async thunk for fetching new products
export const fetchNewProducts = createAsyncThunk(
  "products/fetchNew",
  async (limit = 10, { getState }) => {
    // Check if we already have new products and they're not being loaded
    const state = getState().products
    if (state.newProducts?.length > 0 && !state.newProductsLoading) {
      return state.newProducts
    }
    console.log("Fetching new products...")
    const products = await productService.getNewProducts(limit)
    return products
  }
)

// Async thunk for fetching popular products
export const fetchPopularProducts = createAsyncThunk(
  "products/fetchPopular",
  async (limit = 10, { getState }) => {
    // Check if we already have popular products and they're not being loaded
    const state = getState().products
    if (state.popularProducts?.length > 0 && !state.popularProductsLoading) {
      return state.popularProducts
    }
    console.log("Fetching popular products...")
    const products = await productService.getPopularProducts(limit)
    return products
  }
)

// Async thunk for fetching a single product by ID
export const fetchProductById = createAsyncThunk("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    console.log(`Fetching product details for ID ${id}...`)
    const productData = await getProductById(id)

    // Validate the response data
    if (!productData) {
      console.error("Invalid data format received from API for product details:", productData)
      return rejectWithValue("Invalid data format received from API")
    }

    // API might return data in a different structure than the mock data
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
    items: [],
    newProducts: [],
    popularProducts: [],
    currentProduct: null,
    relatedProducts: [],
    loading: false,
    error: null,
    newProductsLoading: false,
    popularProductsLoading: false,
    newProductsError: null,
    popularProductsError: null,
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
      state.items = updateProductInArray(state.items)
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
    clearErrors: (state) => {
      state.error = null
      state.newProductsError = null
      state.popularProductsError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Keep existing items on error
        if (!state.items.length) {
          state.items = []
        }
      })

      // Handle fetchNewProducts
      .addCase(fetchNewProducts.pending, (state) => {
        state.newProductsLoading = true
        state.newProductsError = null
      })
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        state.newProductsLoading = false
        state.newProducts = action.payload
        state.newProductsError = null
      })
      .addCase(fetchNewProducts.rejected, (state, action) => {
        state.newProductsLoading = false
        state.newProductsError = action.payload
        // Keep existing items on error
        if (!state.newProducts.length) {
          state.newProducts = []
        }
      })

      // Handle fetchPopularProducts
      .addCase(fetchPopularProducts.pending, (state) => {
        state.popularProductsLoading = true
        state.popularProductsError = null
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.popularProductsLoading = false
        state.popularProducts = action.payload
        state.popularProductsError = null
      })
      .addCase(fetchPopularProducts.rejected, (state, action) => {
        state.popularProductsLoading = false
        state.popularProductsError = action.payload
        // Keep existing items on error
        if (!state.popularProducts.length) {
          state.popularProducts = []
        }
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
        // Do not use mock data fallback
        if (!state.currentProduct) {
          state.currentProduct = {
            id: 0,
            name: "Product Not Found",
            price: 0,
            description: "Sorry, we couldn't find the product you're looking for. Please try another product.",
            image: "/placeholder.svg",
            category: "Unknown",
            reviews: []
          }
        }
        if (!state.relatedProducts || !Array.isArray(state.relatedProducts)) {
          state.relatedProducts = []
        }
      })
  },
})

export const { addReview, clearErrors } = productSlice.actions
export default productSlice.reducer