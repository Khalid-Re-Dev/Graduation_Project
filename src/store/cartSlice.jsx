import { createSlice } from "@reduxjs/toolkit"

// Cart slice with reducers for managing cart items
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
  },
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const newItem = action.payload
      const existingItem = state.items.find((item) => item.id === newItem.id)

      if (existingItem) {
        // If item already exists, update quantity
        existingItem.quantity += newItem.quantity
      } else {
        // Otherwise add new item
        state.items.push(newItem)
      }

      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((item) => item.id !== id)

      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },

    // Update item quantity
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)

      if (item) {
        item.quantity = quantity
      }

      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },

    // Clear cart
    clearCart: (state) => {
      state.items = []
      state.total = 0
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
