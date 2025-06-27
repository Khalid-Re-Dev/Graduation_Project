import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProducts,
  getProductDetails,
  getFeaturedProducts,
  getPopularProducts,
  getNewProducts
} from "../services/product.service";

// Async thunk: fetch all products
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProducts();
      if (!data || !Array.isArray(data)) {
        return rejectWithValue("Invalid data format received from API");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

// Async thunk: fetch new products
export const fetchNewProducts = createAsyncThunk(
  "products/fetchNew",
  async (_, { rejectWithValue, getState }) => {
    try {
      const data = await getNewProducts(10);
      if (!data || !Array.isArray(data)) {
        const { allProducts } = getState().products;
        if (allProducts?.length) {
          const sorted = [...allProducts].sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
          return sorted.slice(0, 10);
        }
        return rejectWithValue("Invalid data format for new products");
      }
      return data;
    } catch (error) {
      const { allProducts } = getState().products;
      if (allProducts?.length) {
        const sorted = [...allProducts].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        return sorted.slice(0, 10);
      }
      return rejectWithValue(error.message || "Failed to fetch new products");
    }
  }
);

// Async thunk: fetch popular products
export const fetchPopularProducts = createAsyncThunk(
  "products/fetchPopular",
  async (_, { rejectWithValue, getState }) => {
    try {
      const data = await getPopularProducts(10);
      if (!data || !Array.isArray(data)) {
        const { allProducts } = getState().products;
        if (allProducts?.length) {
          const sorted = [...allProducts].sort(
            (a, b) => (b.popularity || b.likes || 0) - (a.popularity || a.likes || 0)
          );
          return sorted.slice(0, 10);
        }
        return rejectWithValue("Invalid data format for popular products");
      }
      return data;
    } catch (error) {
      const { allProducts } = getState().products;
      if (allProducts?.length) {
        const sorted = [...allProducts].sort(
          (a, b) => (b.popularity || b.likes || 0) - (a.popularity || a.likes || 0)
        );
        return sorted.slice(0, 10);
      }
      return rejectWithValue(error.message || "Failed to fetch popular products");
    }
  }
);

// Async thunk: fetch product details by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const productData = await getProductDetails(id);
      if (!productData) {
        return rejectWithValue("Invalid product details from API");
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

// Slice
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
    addReview: (state, action) => {
      const { productId, review } = action.payload;
      const updateInArray = (arr) =>
        arr.map((prod) =>
          prod.id === productId
            ? { ...prod, reviews: [...(prod.reviews || []), review] }
            : prod
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
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        let products = [];

        if (Array.isArray(action.payload)) {
          products = action.payload;
        } else if (action.payload && typeof action.payload === "object") {
          if (Array.isArray(action.payload.results)) products = action.payload.results;
          else if (Array.isArray(action.payload.products)) products = action.payload.products;
          else if (Array.isArray(action.payload.data)) products = action.payload.data;
          else products = [action.payload];
        }

        products = products.filter(
          (p) => p && typeof p === "object" && (p.id || p.name)
        );

        products = products.map((product) => ({
          id: product.id || Math.random().toString(36).substr(2, 9),
          name: product.name || "Unnamed Product",
          price: product.price || 0,
          image:
            product.image || product.image_url || product.thumbnail || "https://via.placeholder.com/300x300?text=Product+Image",
          category: product.category || product.category_name || "Uncategorized",
          ...product,
        }));

        state.allProducts = products;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      .addCase(fetchNewProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.newProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchNewProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch new products";
        state.newProducts = [];
      })

      .addCase(fetchPopularProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.popularProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPopularProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch popular products";
        state.popularProducts = [];
      })

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentProduct = action.payload.product;
        state.relatedProducts = Array.isArray(action.payload.relatedProducts)
          ? action.payload.relatedProducts
          : [];
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch product details";
        if (!state.currentProduct) {
          state.currentProduct = {
            id: 0,
            name: "Product Not Found",
            price: 0,
            description:
              "Sorry, we couldn't find the product you're looking for. Please try another product.",
            image: "/placeholder.svg",
            category: "Unknown",
            reviews: [],
          };
        }
        if (!Array.isArray(state.relatedProducts)) {
          state.relatedProducts = [];
        }
      });
  },
});

export const { addReview } = productSlice.actions;
export default productSlice.reducer;
