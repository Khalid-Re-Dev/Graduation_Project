import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { login as loginService, register as registerService, logout as logoutService, getUser } from "../services/auth.service"

// Async thunk for user login
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await loginService(credentials)
    return data
  } catch (error) {
    return rejectWithValue(error.message || "Login failed")
  }
})

// Async thunk for user registration
export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const data = await registerService(userData)
    return data
  } catch (error) {
    return rejectWithValue(error.message || "Registration failed")
  }
})

// Async thunk for user logout
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await logoutService()
    return null
  } catch (error) {
    return rejectWithValue(error.message || "Logout failed")
  }
})

// Async thunk to check authentication status
export const checkAuth = createAsyncThunk("auth/check", async (_, { rejectWithValue }) => {
  try {
    const user = getUser()
    if (!user) {
      return null
    }
    return { user }
  } catch (error) {
    return rejectWithValue(error.message || "Authentication check failed")
  }
})

// Auth slice with reducers and actions
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.access // Use access token from JWT response
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Handle register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.access // Use access token from JWT response
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Handle logout
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
      })
      .addCase(logout.rejected, (state, action) => {
        // Even if logout fails on the server, we clear the local state
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = action.payload
      })

      // Handle check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.user = action.payload.user
          state.isAuthenticated = true
        } else {
          state.user = null
          state.token = null
          state.isAuthenticated = false
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
