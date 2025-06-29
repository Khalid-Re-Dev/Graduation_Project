import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reactionService } from "../services/reaction.service";
import { toast } from "react-toastify";

// Async thunk: Toggle like/dislike for a product
export const toggleReaction = createAsyncThunk(
  "reactions/toggleReaction",
  async ({ productId, action }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.isAuthenticated) {
        throw new Error("Please login to react to products");
      }
      const response = await reactionService.toggleReaction(productId, action);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue("This feature is not available yet");
      }
      return rejectWithValue(error.message || "Failed to toggle reaction");
    }
  }
);

// Async thunk: Get user reaction for a product
export const fetchUserReaction = createAsyncThunk(
  "reactions/fetchUserReaction",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reactionService.getUserReaction(productId);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return { productId, reaction: null };
      }
      return rejectWithValue(error.message || "Failed to fetch user reaction");
    }
  }
);

const initialState = {
  userReactions: {},
  productStats: {},
  loading: false,
  error: null,
};

const reactionsSlice = createSlice({
  name: "reactions",
  initialState,
  reducers: {
    clearReactions: (state) => {
      state.userReactions = {};
      state.productStats = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Toggle reaction cases
      .addCase(toggleReaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleReaction.fulfilled, (state, action) => {
        const { productId, action: reactionType, likes, dislikes, userReaction } = action.payload;
        state.loading = false;
        state.error = null;
        
        // Update user reaction
        state.userReactions[productId] = userReaction;
        
        // Update product stats
        state.productStats[productId] = {
          likes: likes || 0,
          dislikes: dislikes || 0,
        };
      })
      .addCase(toggleReaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === "This feature is not available yet") {
          toast.info(action.payload);
        } else {
          toast.error(action.payload);
        }
      })
      
      // Fetch user reaction cases
      .addCase(fetchUserReaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReaction.fulfilled, (state, action) => {
        const { productId, reaction } = action.payload;
        state.loading = false;
        state.error = null;
        state.userReactions[productId] = reaction;
      })
      .addCase(fetchUserReaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReactions } = reactionsSlice.actions;
export default reactionsSlice.reducer;