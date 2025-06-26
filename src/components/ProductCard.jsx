"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toggleFavorite, fetchFavorites } from "../store/favoritesSlice"
import { addCompare, removeCompare } from "../store/compareSlice"
import { ThumbsUp, ThumbsDown, Heart, BarChart2, Check } from "lucide-react"

// Product card component for displaying product information
function ProductCard({ product }) {
  const dispatch = useDispatch()
  const compareItems = useSelector((state) => state.compare.items)
  const favoriteItems = useSelector((state) => state.favorites.items)
  const favoritesLoading = useSelector((state) => state.favorites.loading)
  const compareLoading = useSelector((state) => state.compare.loading)
  const isInCompare = compareItems.some((item) => item.id === product.id)
  const isInFavorites = favoriteItems.some((item) => item.id === product.id)
  const [isHovered, setIsHovered] = useState(false)

  // Safe product object
  const safeProduct = {
    id: product.id,
    name: typeof product.name === 'string' ? product.name : '',
    price: typeof product.price === 'number' || typeof product.price === 'string' ? product.price : '-',
    image: typeof product.image === 'string' && product.image ? product.image : (typeof product.image_url === 'string' && product.image_url ? product.image_url : (typeof product.thumbnail === 'string' && product.thumbnail ? product.thumbnail : "/placeholder.svg")),
    shop_name: typeof product.shop_name === 'string' ? product.shop_name : (product.shop && typeof product.shop.name === 'string' ? product.shop.name : '-'),
    average_rating: typeof product.rating === 'number' ? product.rating : (typeof product.average_rating === 'number' ? product.average_rating : 0),
    discount: typeof product.discount === 'number' ? product.discount : 0,
    likes: typeof product.likes === 'number' ? product.likes : 0,
    dislikes: typeof product.dislikes === 'number' ? product.dislikes : 0,
  };

  if (!safeProduct.name || safeProduct.name === 'Loading...') {
    return null;
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    if (favoritesLoading) return;
    await dispatch(toggleFavorite(product.id));
    dispatch(fetchFavorites());
  }

  const handleToggleCompare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (compareLoading) return
    if (isInCompare) {
      dispatch(removeCompare(product.id))
    } else {
      dispatch(addCompare(product))
    }
  }

  return (
    <div
      className="bg-white border border-gray-200 shadow-sm overflow-hidden relative flex flex-col w-full max-w-[300px] min-w-[220px] mx-auto my-4 p-4 transition-transform duration-200 hover:shadow-lg rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount badge */}
      {safeProduct.discount > 0 && (
        <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded z-10 shadow-sm tracking-tight">
          {safeProduct.discount}% OFF
        </div>
      )}
      <Link to={`/products/${encodeURIComponent(String(safeProduct.id))}`} className="flex-1 flex flex-col items-center w-full">
        {/* Product image */}
        <div className="relative flex flex-col items-center justify-center w-full mb-2">
          <img
            src={safeProduct.image}
            alt={safeProduct.name || "Product"}
            className="w-full h-52 object-cover rounded-md"
            onError={(e) => {
              if (!e.target.src.endsWith('/placeholder.svg')) {
                e.target.src = '/placeholder.svg';
              }
            }}
          />
          {/* Favorite & Compare icons overlayed above the product name, but not covering it */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full bg-white shadow transition hover:scale-110 ${isInFavorites ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
              title={isInFavorites ? "Remove from favorites" : "Add to favorites"}
              tabIndex={-1}
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)', opacity: 0.7 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
            >
              <Heart size={18} className={isInFavorites ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleToggleCompare}
              className={`p-2 rounded-full bg-white shadow transition hover:scale-110 ${isInCompare ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
              title={isInCompare ? "Remove from compare" : "Add to compare"}
              tabIndex={-1}
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)', opacity: 0.7 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
            >
              {isInCompare ? <Check size={18} /> : <BarChart2 size={18} />}
            </button>
          </div>
        </div>
        {/* Product name */}
        <h3 className="text-base font-semibold text-gray-900 text-center leading-snug tracking-tight mb-2 line-clamp-2 min-h-[1.8rem]">{safeProduct.name || 'Unnamed Product'}</h3>
        {/* Shop row with likes/dislikes */}
        <div className="flex items-center justify-between w-full px-1 mb-2 relative min-h-[32px]">
          {/* Dislike icon (right) */}
          <div className={`flex items-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
            <span className="text-xs text-gray-700 font-medium">{safeProduct.dislikes}</span>
            <ThumbsDown size={20} className="text-red-500 ml-1" />
          </div>
          {/* Shop name (center) */}
          <div className="flex-1 flex justify-center">
            <span className="text-xs sm:text-sm text-gray-500 font-medium text-center line-clamp-1">{safeProduct.shop_name}</span>
          </div>
          {/* Like icon (left) */}
          <div className={`flex items-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
            <ThumbsUp size={20} className="text-green-500 mr-1" />
            <span className="text-xs text-gray-700 font-medium">{safeProduct.likes}</span>
          </div>
        </div>
        {/* Rating and price row */}
        <div className="flex items-center justify-between w-full px-1 mb-2">
          <span className="font-medium text-xs sm:text-sm text-gray-900 tracking-tight">{typeof safeProduct.price === 'number' || (typeof safeProduct.price === 'string' && safeProduct.price.match(/^[\d.]+$/)) ? `$${safeProduct.price}` : '-'}</span>
          <span className="flex items-center text-xs sm:text-sm text-gray-700 font-medium gap-1">
            <span className="ml-1">{Number(safeProduct.average_rating).toFixed(1)}</span>
            <span className="text-gray-400">/ 5</span>
          </span>
        </div>
        {/* Details button */}
        <button className="w-full mt-1 py-2 rounded-lg border border-gray-200 text-gray-900 font-medium text-sm sm:text-base hover:bg-gray-50 transition">Details</button>
      </Link>
    </div>
  )
}

export default ProductCard
