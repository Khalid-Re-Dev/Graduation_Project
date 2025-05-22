import { createSlice } from "@reduxjs/toolkit"

// Compare slice with reducers for managing product comparison
const compareSlice = createSlice({
  name: "compare",
  initialState: {
    items: [],
  },
  reducers: {
    // Add product to compare
    addToCompare: (state, action) => {
      const product = action.payload
      // Check if product is already in compare
      const existingItem = state.items.find((item) => item.id === product.id)

      if (!existingItem) {
        // Limit to 4 products for comparison
        if (state.items.length >= 4) {
          // Remove the oldest item
          state.items.shift()
        }
        state.items.push(product)
      }
    },

    // Remove product from compare
    removeFromCompare: (state, action) => {
      const productId = action.payload
      state.items = state.items.filter((item) => item.id !== productId)
    },

    // Clear all products from compare
    clearCompare: (state) => {
      state.items = []
    },
  },
})

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions
export default compareSlice.reducer
