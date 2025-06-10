"use client"

// NOTE: تم التأكد من أن الكارد لا يعرض أي قيمة رقمية (مثل 0) أعلى الكارد. إذا استمر ظهور الرقم، السبب غالباً من مكون آخر أو من طريقة تمرير البيانات. تأكد أن الكارد يبدأ مباشرة من div الرئيسي ولا يوجد أي نص أو متغير قبله.

// حل جذري لمشكلة ظهور الصفر أعلى الكارد:
// إذا تم تمرير id=0 أو أي قيمة غير مطلوبة، تجاهلها ولا تعرضها أبداً
// الكارد يبدأ فقط من div الرئيسي ولا يوجد أي نص أو رقم قبله

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { addFavorite, removeFavorite, addFavoriteLocal, removeFavoriteLocal, fetchFavorites } from "../store/favoritesSlice"
import { addCompare, removeCompare } from "../store/compareSlice"
import { Star, Heart, BarChart2, Check } from "lucide-react"
import { productService } from "../services/product.service"

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
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(null)
  const [userRating, setUserRating] = useState(null)
  const [loadingReviews, setLoadingReviews] = useState(false)

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (favoritesLoading) return;
    if (isInFavorites) {
      dispatch(removeFavoriteLocal(product.id)); // تفعيل فوري
      await dispatch(removeFavorite(product.id));      // مزامنة مع الباك إند
      dispatch(fetchFavorites()); // تحديث المفضلة فوراً بعد الحذف
    } else {
      dispatch(addFavoriteLocal(product));       // تفعيل فوري
      await dispatch(addFavorite(product));            // مزامنة مع الباك إند
      dispatch(fetchFavorites()); // تحديث المفضلة فوراً بعد الإضافة
    }
  }

  const handleToggleCompare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (compareLoading) return // منع التكرار أثناء التحميل
    if (isInCompare) {
      dispatch(removeCompare(product.id))
    } else {
      dispatch(addCompare(product))
    }
  }

  // جلب التقييمات من السيرفر عند تحميل الكارد أو تغيير المنتج
  useEffect(() => {
    let isMounted = true
    setLoadingReviews(true)
    productService.getProductReviews(product.id)
      .then((data) => {
        if (!isMounted) return
        setReviews(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length > 0) {
          const avg = data.reduce((sum, r) => sum + (typeof r.rating === 'number' ? r.rating : 0), 0) / data.length
          setAverageRating(avg)
        } else {
          setAverageRating(0)
        }
      })
      .catch(() => {
        setReviews([])
        setAverageRating(0)
      })
      .finally(() => setLoadingReviews(false))
    return () => { isMounted = false }
  }, [product.id])

  // إرسال تقييم جديد عند اختيار المستخدم
  const handleRate = async (rating) => {
    setUserRating(rating)
    try {
      await productService.addProductReview(product.id, rating)
      // إعادة جلب التقييمات بعد التقييم
      const data = await productService.getProductReviews(product.id)
      setReviews(Array.isArray(data) ? data : [])
      if (Array.isArray(data) && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + (typeof r.rating === 'number' ? r.rating : 0), 0) / data.length
        setAverageRating(avg)
      } else {
        setAverageRating(0)
      }
    } catch (e) {
      // يمكن عرض رسالة خطأ هنا
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

  // إصلاح: اعرض الكارد إذا كان الاسم موجود وليس 'Loading...'. لا تعتمد فقط على id.
  if (!safeProduct.name || safeProduct.name === 'Loading...') {
    return null;
  }

  return (
    <div
      className="bg-white border border-gray-200 shadow-sm overflow-hidden relative flex flex-col w-full max-w-[300px] min-w-[220px] mx-auto my-4 p-4 transition-transform duration-200 hover:shadow-lg"
      style={{ borderRadius: '8px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount badge */}
      {safeProduct.discount > 0 && (
        <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded z-10 shadow-sm tracking-tight">
          {safeProduct.discount}% OFF
        </div>
      )}
      <Link to={`/products/${encodeURIComponent(String(safeProduct.id))}`} className="flex-1 flex flex-col items-center">
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
          {/* Favorite & Compare icons centered at image bottom */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
            <button
              onClick={handleToggleFavorite}
              className={`pointer-events-auto p-2 rounded-full bg-white shadow transition hover:scale-110 ${isInFavorites ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
              title={isInFavorites ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} className={isInFavorites ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleToggleCompare}
              className={`pointer-events-auto p-2 rounded-full bg-white shadow transition hover:scale-110 ${isInCompare ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
              title={isInCompare ? "Remove from compare" : "Add to compare"}
            >
              {isInCompare ? <Check size={18} /> : <BarChart2 size={18} />}
            </button>
          </div>
        </div>
        {/* Product details */}
        <div className="flex flex-col items-center w-full space-y-1.5">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 text-center leading-snug tracking-tight mb-0.5 line-clamp-2 min-h-[1.8rem]">{safeProduct.name || 'Unnamed Product'}</h3>
          {safeProduct.shop_name && <p className="text-xs sm:text-sm text-gray-500 text-center leading-snug mt-0 mb-0.5 line-clamp-1">{safeProduct.shop_name}</p>}
          <div className="flex items-center justify-between w-full px-1 mb-2">
            <span className="font-medium text-xs sm:text-sm text-gray-900 tracking-tight">{typeof safeProduct.price === 'number' || (typeof safeProduct.price === 'string' && safeProduct.price.match(/^[\d.]+$/)) ? `$${safeProduct.price}` : '-'}</span>
            <span className="flex items-center text-xs sm:text-sm text-gray-500 font-medium gap-1">
              <Star size={15} className="text-yellow-400" />
              <span
                onMouseLeave={() => setHoverRating(null)}
                className="flex gap-0.5 cursor-pointer"
              >
                {[1,2,3,4,5].map((star) => (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => handleRate(star)}
                    style={{ color: (hoverRating || userRating || Math.round(averageRating)) >= star ? '#facc15' : '#d1d5db' }}
                  >
                    ★
                  </span>
                ))}
              </span>
              <span className="ml-1">{loadingReviews ? '...' : Number(averageRating).toFixed(1)}</span>
            </span>
          </div>
          <button className="w-full mt-1 py-2 rounded-lg border border-gray-200 text-gray-900 font-medium text-sm sm:text-base hover:bg-gray-50 transition">Details</button>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
