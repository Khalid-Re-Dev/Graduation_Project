"use client"

import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { removeFavorite, fetchFavorites, clearFavorites } from "../store/favoritesSlice"
import { Trash2, ShoppingBag, Heart } from "lucide-react"
import ProductCard from "../components/ProductCard"
import { useEffect } from "react"

// Favorites page component
function FavoritesPage() {
  const dispatch = useDispatch()
  const { items, loading, error, isGuest } = useSelector((state) => state.favorites)
  const { isAuthenticated } = useSelector((state) => state.auth)

  // جلب المفضلة من الباك إند عند تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavorites())
    }
  }, [dispatch, isAuthenticated])

  const handleRemoveItem = (id) => {
    dispatch(removeFavorite(id))
  }

  const handleClearAll = () => {
    dispatch(clearFavorites())
  }

  // حالة عدم تسجيل الدخول
  if (!isAuthenticated && (!items || items.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Heart className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Favorites List</h2>
          <p className="mb-6">Please log in to view and manage your favorites.</p>
          <Link
            to="/login"
            className="bg-[#005580] text-white px-6 py-2 rounded-md hover:bg-[#004466] transition-colors inline-block"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  // حالة التحميل
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-blue-200 border-t-[#005580] rounded-full"></div>
          <h2 className="text-2xl font-bold mb-4">Loading your favorites...</h2>
        </div>
      </div>
    )
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Heart className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error loading favorites</h2>
          <p className="mb-6 text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // حالة المفضلة الفارغة
  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Favorites List is Empty</h2>
          <p className="mb-6">Save items you love to your favorites list and they'll show up here.</p>
          <Link
            to="/products"
            className="bg-[#005580] text-white px-6 py-2 rounded-md hover:bg-[#004466] transition-colors inline-block"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  // عرض المفضلة
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <button
          onClick={handleClearAll}
          className="text-red-500 flex items-center hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard product={item} />
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                title="Remove from favorites"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FavoritesPage
