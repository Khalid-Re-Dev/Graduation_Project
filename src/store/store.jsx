import { configureStore } from "@reduxjs/toolkit"
import productReducer from "./productSlice"
import authReducer from "./authSlice"
import compareReducer from "./compareSlice"
import favoritesReducer from "./favoritesSlice"
import reactionsReducer from "./reactionsSlice"

const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    compare: compareReducer,
    favorites: favoritesReducer,
    reactions: reactionsReducer,
  },
})

export default store

