import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getProducts,
  getProductDetails,
  getFeaturedProducts,
  getPopularProducts,
  getNewProducts,
} from '../services/product.service';

// Async thunk: fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProducts();
      if (!Array.isArray(data)) {
        return rejectWithValue('Invalid data format received from API');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

// Async thunk: fetch new products
export const fetchNewProducts = createAsyncThunk(
  'products/fetchNew',
  async (_, { rejectWithValue, getState }) => {
    try {
      const data = await getNewProducts(10);
      if (!Array.isArray(data)) {
        // fallback to store data
        const { allProducts } = getState().products;
        if (allProducts && allProducts.length) {
          const sorted = [...allProducts].sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
          return sorted.slice(0, 10);
        }
        return rejectWithValue('Invalid data format received from API');
      }
      return data;
    } catch (error) {
      // fallback to store data
      const { allProducts } = getState().products;
      if (allProducts && allProducts.length) {
        const sorted = [...allProducts].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        return sorted.slice(0, 10);
      }
      return rejectWithValue(error.message || 'Failed to fetch new products');
    }
  }
);

// Async thunk: fetch popular products
export const fetchPopularProducts = createAsyncThunk(
  'products/fetchPopular',
  async (_, { rejectWithValue, getState }) => {
    try {
      const data = await getPopularProducts(10);
      if (!Array.isArray(data)) {
        // fallback to store data
        const { allProducts } = getState().products;
        if (allProducts && allProducts.length) {
          const sorted = [...allProducts].sort(
            (a, b) => (b.popularity || b.likes || 0) - (a.popularity || a.likes || 0)
          );
          return sorted.slice(0, 10);
        }
        return rejectWithValue('Invalid data format received from API');
      }
      return data;
    } catch (error) {
      // fallback to store data
      const { allProducts } = getState().products;
      if (allProducts && allProducts.length) {
        const sorted = [...allProducts].sort(
          (a, b) => (b.popularity || b.likes || 0) - (a.popularity || a.likes || 0)
        );
        return sorted.slice(0, 10);
      }
      return rejectWithValue(error.message || 'Failed to fetch popular products');
    }
  }
);

// Async thunk: fetch single product details by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const productData = await getProductDetails(id);
      if (!productData) {
        return rejectWithValue('Invalid data format received from API');
      }
      return {
        product: productData.product || productData,
        relatedProducts: productData.relatedProducts || [],
      };
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch product details for ID ${id}`);
    }
  }
);

// The products slice
const productSlice = createSlice({
  name: 'products',
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
    addReview: (state, action) => {
      const { productId, review } = action.payload;

      const updateInArray = (arr) =>
        arr.map((product) =>
          product.id === productId
            ? { ...product, reviews: [...(product.reviews || []), review] }
            : product
        );

      state.allProducts = updateInArray(state.allProducts);
      state.newProducts = updateInArray(state.newProducts);
      state.popularProducts = updateInArray(state.popularProducts);

      if (state.currentProduct?.id === productId) {
        state.currentProduct = {
          ...state.currentProduct,
          reviews: [...(state.currentProduct.reviews || []), review],
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allProducts = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })

      // fetchNewProducts
      .addCase(fetchNewProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.newProducts = action.payload;
      })
      .addCase(fetchNewProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch new products';
        state.newProducts = [];
      })

      // fetchPopularProducts
      .addCase(fetchPopularProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.popularProducts = action.payload;
      })
      .addCase(fetchPopularProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch popular products';
        state.popularProducts = [];
      })

      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.relatedProducts;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product details';
        state.currentProduct = null;
        state.relatedProducts = [];
      });
  },
});

export const { addReview } = productSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.allProducts;
export const selectNewProducts = (state) => state.products.newProducts;
export const selectPopularProducts = (state) => state.products.popularProducts;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectRelatedProducts = (state) => state.products.relatedProducts;
export const selectLoading = (state) => state.products.loading;
export const selectError = (state) => state.products.error;

export default productSlice.reducer;
