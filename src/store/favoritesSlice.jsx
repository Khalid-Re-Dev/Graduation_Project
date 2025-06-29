import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getFavorites, toggleFavorite as toggleFavoriteService, removeFromFavorites as removeFromFavoritesService, isFavorite as isFavoriteService } from "../services/user.service"

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

// Async thunk: تبديل حالة المفضلة (toggle)
export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async (productId, { rejectWithValue }) => {
    try {
      // POST /api/user/favorites/toggle/{product_id}/
      const res = await toggleFavoriteService(productId);
      return { productId, isFavorite: res && res.is_favorite };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to toggle favorite")
    }
  }
)

// Async thunk: تحقق هل المنتج في المفضلة
export const checkFavoriteStatus = createAsyncThunk(
  "favorites/checkFavoriteStatus",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await isFavoriteService(productId);
      return { productId, isFavorite: res && res.is_favorite };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to check favorite status");
    }
  }
);

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
      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { productId, isFavorite } = action.payload || {};
        if (typeof isFavorite === "boolean") {
          if (isFavorite) {
            // أضف المنتج إذا لم يكن موجودًا
            if (!state.items.some((item) => item.id === productId)) {
              state.items.push({ id: productId }); // يمكن جلب بيانات المنتج لاحقًا
            }
          } else {
            // احذف المنتج إذا كان موجودًا
            state.items = state.items.filter((item) => item.id !== productId);
          }
          saveGuestFavorites(state.items);
        }
      })
  },
});

export const { clearFavorites, addFavoriteLocal, removeFavoriteLocal, setIsGuest, mergeFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
