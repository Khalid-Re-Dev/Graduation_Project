import { createSlice } from "@reduxjs/toolkit"

// Favorites slice with reducers for managing favorite items
const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
  },
  reducers: {
    // Add item to favorites
    addToFavorites: (state, action) => {
      const newItem = action.payload
      const existingItem = state.items.find((item) => item.id === newItem.id)

      if (!existingItem) {
        // Only add if not already in favorites
        state.items.push(newItem)
      }
    },

    // Remove item from favorites
    removeFromFavorites: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((item) => item.id !== id)
    },

    // Clear all favorites
    clearFavorites: (state) => {
      state.items = []
    },
  },
})

export const { addToFavorites, removeFromFavorites, clearFavorites } = favoritesSlice.actions
export default favoritesSlice.reducer
