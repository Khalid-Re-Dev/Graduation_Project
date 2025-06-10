import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getFavorites, addToFavorites, removeFromFavorites as removeFromFavoritesService } from "../services/user.service"

// Async thunk: جلب المفضلة من الباك إند
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getFavorites()
      // API قد يعيد مصفوفة منتجات أو كائن فيه items
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.items)) return data.items
      return []
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch favorites")
    }
  }
)

// Async thunk: إضافة منتج للمفضلة
export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (product, { rejectWithValue }) => {
    try {
      await addToFavorites(product.id)
      return product
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add to favorites")
    }
  }
)

// Async thunk: حذف منتج من المفضلة
export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (productId, { rejectWithValue }) => {
    try {
      await removeFromFavoritesService(productId)
      return productId
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove from favorites")
    }
  }
)

// Helpers for sessionStorage
const SESSION_KEY = 'guest_favorites';
function loadGuestFavorites() {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}
function saveGuestFavorites(items) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(items)); } catch {}
}

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: loadGuestFavorites(),
    loading: false,
    error: null,
    isGuest: true, // يتم تحديثها عند تسجيل الدخول
  },
  reducers: {
    clearFavorites: (state) => {
      state.items = [];
      saveGuestFavorites([]);
    },
    // إضافة/حذف محلي للزائر (Optimistic)
    addFavoriteLocal: (state, action) => {
      if (!state.items.some((item) => item.id === action.payload.id)) {
        state.items.push(action.payload);
        saveGuestFavorites(state.items);
      }
    },
    removeFavoriteLocal: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveGuestFavorites(state.items);
    },
    setIsGuest: (state, action) => {
      state.isGuest = action.payload;
    },
    mergeFavorites: (state, action) => {
      // دمج المفضلة المحلية مع مفضلة الباك إند بدون تكرار
      const backend = action.payload || [];
      const merged = [...backend];
      state.items.forEach((item) => {
        if (!merged.some((b) => b.id === item.id)) merged.push(item);
      });
      state.items = merged;
      saveGuestFavorites([]); // بعد الدمج، امسح مفضلة الزائر
    },
  },
  extraReducers: (builder) => {
    builder
      // جلب المفضلة
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.isGuest = false;
        // دمج مع مفضلة الزائر إذا وجدت
        const guest = loadGuestFavorites();
        const backend = action.payload || [];
        const merged = [...backend];
        guest.forEach((item) => {
          if (!merged.some((b) => b.id === item.id)) merged.push(item);
        });
        state.items = merged;
        saveGuestFavorites([]);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // إضافة للمفضلة (Optimistic)
      .addCase(addFavorite.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        // أضف المنتج إذا لم يكن موجودًا
        if (!state.items.some((item) => item.id === action.payload.id)) {
          state.items.push(action.payload);
          saveGuestFavorites(state.items);
        }
        // بعد الإضافة، جلب المفضلة من السيرفر
        // ملاحظة: dispatch غير متاح هنا مباشرة في extraReducers، الحل: استخدم thunk في ProductCard أو FavoritesPage
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })
      // حذف من المفضلة (Optimistic)
      .addCase(removeFavorite.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        saveGuestFavorites(state.items);
        // بعد الحذف، جلب المفضلة من السيرفر
        // ملاحظة: dispatch غير متاح هنا مباشرة في extraReducers، الحل: استخدم thunk في ProductCard أو FavoritesPage
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearFavorites, addFavoriteLocal, removeFavoriteLocal, setIsGuest, mergeFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
