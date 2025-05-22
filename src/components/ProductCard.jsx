"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { addToFavorites, removeFromFavorites } from "../store/favoritesSlice"
import { addToCompare, removeFromCompare } from "../store/compareSlice"
import { Star, Heart, BarChart2, Check } from "lucide-react"

// Product card component for displaying product information
function ProductCard({ product }) {
  const dispatch = useDispatch()
  const compareItems = useSelector((state) => state.compare.items)
  const favoriteItems = useSelector((state) => state.favorites.items)
  const isInCompare = compareItems.some((item) => item.id === product.id)
  const isInFavorites = favoriteItems.some((item) => item.id === product.id)
  const [isHovered, setIsHovered] = useState(false)

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInFavorites) {
      dispatch(removeFromFavorites(product.id))
    } else {
      dispatch(addToFavorites(product))
    }
  }

  const handleToggleCompare = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInCompare) {
      dispatch(removeFromCompare(product.id))
    } else {
      dispatch(addToCompare(product))
    }
  }

  // Ensure product is valid and log for debugging
  console.log("ProductCard received product:", product);

  if (!product || typeof product !== 'object') {
    console.error("Invalid product data received in ProductCard:", product)
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <div className="text-center text-red-500">
          <p>Error: Invalid product data</p>
        </div>
      </div>
    )
  }

  // Create a safe product object with default values for all required properties
  const safeProduct = {
    id: product.id || Math.random().toString(36).substring(2, 9),
    name: product.name || "Unnamed Product",
    price: product.price || 0,
    image: product.image || product.image_url || product.thumbnail || "https://via.placeholder.com/300x300?text=Product+Image",
    category: product.category || product.category_name || "Uncategorized",
    reviews: product.reviews || [],
    average_rating: product.average_rating || 0,
    discount: product.discount || 0,
    stock: product.stock || 0,
    ...product // Keep all original properties
  }

  // Defensive: If id is not valid, show error card
  if (!safeProduct.id || safeProduct.id === 0 || safeProduct.id === "0" || safeProduct.id === "undefined" || safeProduct.id === "null") {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <div className="text-center text-red-500">
          <p>Error: Product ID is invalid</p>
        </div>
      </div>
    )
  }

  // Calculate average rating using the safe product object
  const averageRating =
    safeProduct.reviews && safeProduct.reviews.length > 0
      ? safeProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / safeProduct.reviews.length
      : safeProduct.average_rating || 0

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount badge */}
      {safeProduct.discount && safeProduct.discount > 0 && (
        <div className="absolute top-2 left-2 bg-[#ffb700] text-black text-xs font-bold px-2 py-1 rounded">
          {safeProduct.discount}% OFF
        </div>
      )}

      <Link to={`/products/${encodeURIComponent(String(safeProduct.id))}`}>
        <div className="relative p-4">
          {/* Product image */}
          <div className="relative">
            <img
              src={safeProduct.image || "https://via.placeholder.com/300x300?text=Product+Image"}
              alt={safeProduct.name || "Product"}
              className="w-full h-48 object-contain mb-4"
              onError={(e) => {
                console.warn("Image failed to load, using placeholder:", safeProduct.name)
                e.target.src = "https://via.placeholder.com/300x300?text=Image+Not+Found"
              }}
            />

            {/* Hover actions */}
            <div
              className={`absolute bottom-0 left-0 right-0 flex justify-center space-x-2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full ${isInFavorites ? "bg-red-500 text-white" : "bg-white text-red-500"} hover:bg-opacity-90 shadow-md`}
                title={isInFavorites ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart size={18} className={isInFavorites ? "fill-current" : ""} />
              </button>
              <button
                onClick={handleToggleCompare}
                className={`p-2 rounded-full ${isInCompare ? "bg-green-600 text-white" : "bg-white text-gray-700"} hover:bg-opacity-90 shadow-md`}
                title={isInCompare ? "Remove from compare" : "Add to compare"}
              >
                {isInCompare ? <Check size={18} /> : <BarChart2 size={18} />}
              </button>
            </div>
          </div>

          {/* Product details */}
          <h3 className="text-lg font-medium mb-1">{safeProduct.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{safeProduct.category}</p>

          {/* Price and rating */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center">
                {averageRating.toFixed(1)} <Star size={12} className="ml-1 fill-current" />
              </div>
              <div className="font-bold">${safeProduct.price}</div>
            </div>
            {safeProduct.stock !== undefined && <div className="text-gray-600 text-sm">{safeProduct.stock} in stock</div>}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex justify-center">
            <button
              className={`py-1 px-4 rounded text-sm transition-colors flex items-center ${
                isInFavorites
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-[#005580] text-white hover:bg-[#004466]"
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart size={16} className={`mr-1 ${isInFavorites ? "fill-current" : ""}`} />
              {isInFavorites ? "Saved" : "Add to Favorites"}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
