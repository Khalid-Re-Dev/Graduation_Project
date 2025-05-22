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
  // Removed extra error handling and fallback cards, keep only minimal validation
  if (!product || typeof product !== 'object') {
    return null;
  }

  // Create a safe product object with default values for all required properties
  const safeProduct = {
    id: product.id,
    name: typeof product.name === 'string' ? product.name : '',
    price: typeof product.price === 'number' || typeof product.price === 'string' ? product.price : '-',
    image: typeof product.image === 'string' && product.image ? product.image : (typeof product.image_url === 'string' && product.image_url ? product.image_url : (typeof product.thumbnail === 'string' && product.thumbnail ? product.thumbnail : "/placeholder.svg")),
    category: typeof product.category === 'object' && product.category && typeof product.category.name === 'string' ? product.category.name : (typeof product.category === 'string' ? product.category : (typeof product.category_name === 'string' ? product.category_name : 'Uncategorized')),
    brand: typeof product.brand === 'object' && product.brand && typeof product.brand.name === 'string' ? product.brand.name : (typeof product.brand === 'string' ? product.brand : '-'),
    reviews: Array.isArray(product.reviews) ? product.reviews : [],
    average_rating: typeof product.rating === 'number' ? product.rating : (typeof product.average_rating === 'number' ? product.average_rating : 0),
    discount: typeof product.discount === 'number' ? product.discount : 0,
    original_price: typeof product.original_price === 'number' ? product.original_price : null,
    stock: typeof product.stock === 'number' || typeof product.stock === 'string' ? product.stock : (typeof product.in_stock === 'boolean' ? (product.in_stock ? 'In Stock' : 'Out of Stock') : '-'),
    created_at: product.created_at || null,
    likes: typeof product.likes === 'number' ? product.likes : 0,
    dislikes: typeof product.dislikes === 'number' ? product.dislikes : 0,
    views: typeof product.views === 'number' ? product.views : 0,
    shop_name: typeof product.shop_name === 'string' ? product.shop_name : (product.shop && typeof product.shop.name === 'string' ? product.shop.name : '-'),
    video_url: typeof product.video_url === 'string' ? product.video_url : null,
    description: typeof product.description === 'string' ? product.description : '',
  };

  // Calculate average rating using the safe product object
  const averageRating =
    safeProduct.reviews && safeProduct.reviews.length > 0
      ? safeProduct.reviews.reduce((sum, review) => sum + (typeof review.rating === 'number' ? review.rating : 0), 0) / safeProduct.reviews.length
      : safeProduct.average_rating || 0;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden relative"
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
              src={
                product.image &&
                !["https://via.placeholder.com/300x300?text=Image+Not+Found", "", null, undefined].includes(product.image)
                  ? product.image
                  : "/placeholder.svg"
              }
              alt={product.name || "Product"}
              className="w-full h-48 object-contain mb-4"
              onError={(e) => {
                if (!e.target.src.endsWith('/placeholder.svg')) {
                  e.target.src = '/placeholder.svg';
                }
              }}
            />
            {/* Hover actions */}
            <div className={`absolute bottom-0 left-0 right-0 flex justify-center space-x-2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
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
          <h3 className="text-lg font-medium mb-1">{safeProduct.name || 'Unnamed Product'}</h3>
          <p className="text-sm text-gray-600 mb-1">Category: {typeof safeProduct.category === 'string' ? safeProduct.category : (safeProduct.category && safeProduct.category.name ? safeProduct.category.name : 'Uncategorized')}</p>
          <p className="text-sm text-gray-600 mb-1">Brand: {safeProduct.brand}</p>
          {safeProduct.shop_name && <p className="text-xs text-gray-500 mb-1">Shop: {safeProduct.shop_name}</p>}
          {safeProduct.created_at && <p className="text-xs text-gray-400 mb-1">Added: {new Date(safeProduct.created_at).toLocaleDateString()}</p>}
          {safeProduct.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{safeProduct.description}</p>}
          {/* Price and rating */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center">
                {Number(averageRating).toFixed(1)} <Star size={12} className="ml-1 fill-current" />
              </div>
              <div className="font-bold text-lg">{typeof safeProduct.price === 'number' || (typeof safeProduct.price === 'string' && safeProduct.price.match(/^\d+(\.\d+)?$/)) ? `$${safeProduct.price}` : '-'}</div>
              {safeProduct.original_price && safeProduct.original_price > safeProduct.price && (
                <span className="line-through text-gray-400 text-xs ml-2">${safeProduct.original_price}</span>
              )}
            </div>
            <div className="flex flex-col items-end">
              {safeProduct.stock !== undefined && <div className="text-gray-600 text-sm">{typeof safeProduct.stock === 'string' || typeof safeProduct.stock === 'number' ? safeProduct.stock : '-'}</div>}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>Likes: {typeof safeProduct.likes === 'number' ? safeProduct.likes : 0}</span>
                <span>Views: {typeof safeProduct.views === 'number' ? safeProduct.views : 0}</span>
              </div>
            </div>
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
