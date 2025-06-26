import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { login as loginService, register as registerService, logout as logoutService, getUser, getToken } from "../services/auth.service"

// Async thunk for user login
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await loginService(credentials)
    return data
  } catch (error) {
    let message = error?.response?.data?.error || error?.message || "Login failed. Please check your email and password.";
    // CORS/Network error detection
    if (message && (message.includes("NetworkError") || message.includes("CORS") || message.includes("Failed to fetch"))) {
      message = "Network error or CORS issue: Unable to reach the server. Please try again later or contact support.";
    }
    // If backend returns Arabic error, replace with English
    if (message.includes("بيانات الاعتماد غير صحيحة")) {
      message = "Invalid email or password. Please try again.";
    }
    return rejectWithValue(message)
  }
})

// Async thunk for user registration
export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const data = await registerService(userData)
    // Registration endpoint returns only user and message, not tokens
    return data
  } catch (error) {
    let message = error?.response?.data?.error || error?.message || "Registration failed. Please check your information.";
    if (message && (message.includes("NetworkError") || message.includes("CORS") || message.includes("Failed to fetch"))) {
      message = "Network error or CORS issue: Unable to reach the server. Please try again later or contact support.";
    }
    if (message.includes("مستخدم بنفس هذا البريد الإلكتروني موجود بالفعل")) {
      message = "A user with this email already exists.";
    }
    return rejectWithValue(message)
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
    const token = getToken()
    
    // Only consider authenticated if both user and token exist
    if (!user || !token) {
      return null
    }
    
    return { user, token }
  } catch (error) {
    return rejectWithValue(error.message || "Authentication check failed")
  }
})

// Initialize state from storage, but don't assume authenticated just because data exists
const initialUser = getUser();
const initialToken = getToken();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: false, // Start as false, let checkAuth determine this
    loading: true, // Start as true until initial check completes
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.successMessage = null
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
        state.successMessage = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = false // User is not logged in after registration
        state.token = null
        state.successMessage = action.payload.message || "Registration successful! Please login."
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.successMessage = null
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
          state.token = action.payload.token
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

export const { clearError, clearSuccess } = authSlice.actions
export default authSlice.reducer
