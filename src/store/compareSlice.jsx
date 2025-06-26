import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiService } from "../services/api.service"
import { API_ENDPOINTS } from "../config/api.config"

// Async thunk: جلب قائمة المقارنة من الباك إند
export const fetchCompare = createAsyncThunk(
  "compare/fetchCompare",
  async (_, { rejectWithValue, getState }) => {
    try {
      // جلب المنتجات المضافة للمقارنة من الحالة أو localStorage أو backend حسب التصميم
      // هنا سنجلب المنتجات من الحالة الحالية (مثلاً ids محفوظة في localStorage)
      // أو يمكن تعديل المنطق لاحقاً حسب الحاجة
      // حالياً سنعيد مصفوفة فارغة لأن API لا يدعم جلب كل المقارنات دفعة واحدة
      return []
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch comparison list")
    }
  }
)

// Async thunk: إضافة منتج للمقارنة (محلي فقط)
export const addCompare = createAsyncThunk(
  "compare/addCompare",
  async (product, { rejectWithValue }) => {
    try {
      // لا ترسل أي طلب للباك إند، فقط أعد المنتج
      return product
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add to comparison")
    }
  }
)

// Async thunk: حذف منتج من المقارنة (محلي فقط)
export const removeCompare = createAsyncThunk(
  "compare/removeCompare",
  async (productId, { rejectWithValue }) => {
    try {
      // لا ترسل أي طلب للباك إند، فقط أعد id
      return productId
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove from comparison")
    }
  }
)

const compareSlice = createSlice({
  name: "compare",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCompare: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompare.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCompare.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload || []
      })
      .addCase(fetchCompare.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addCompare.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addCompare.fulfilled, (state, action) => {
        state.loading = false
        // أضف المنتج إذا لم يكن موجودًا
        if (!state.items.some((item) => item.id === action.payload.id)) {
          // حد أقصى 4 عناصر
          if (state.items.length >= 4) {
            state.items.shift()
          }
          state.items.push(action.payload)
        }
      })
      .addCase(addCompare.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(removeCompare.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeCompare.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeCompare.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearCompare } = compareSlice.actions
export default compareSlice.reducer
