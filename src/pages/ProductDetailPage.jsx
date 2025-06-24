"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchProductById } from "../store/productSlice"
import { toggleFavorite } from "../store/favoritesSlice"
import { addCompare, removeCompare } from "../store/compareSlice"
import { Heart, Minus, Plus, Monitor, Cpu, MemoryStick, BarChart2, Check } from "lucide-react"
import ProductCard from "../components/ProductCard"

// Product detail page showing full product information
function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentProduct, relatedProducts, loading, error } = useSelector((state) => state.products)
  const compareItems = useSelector((state) => state.compare.items)
  const favoriteItems = useSelector((state) => state.favorites.items)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState("description")

  const isInCompare = compareItems.some((item) => item.id === Number(id))
  const isInFavorites = favoriteItems.some((item) => item.id === Number(id))

  // حالة تفاعل المستخدم مع المنتج
  const [userReaction, setUserReaction] = useState("neutral");
  const [reactionCounts, setReactionCounts] = useState({ likes: 0, dislikes: 0, neutrals: 0 });

  // حالة المراجعات
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchReaction = async () => {
        try {
          // جلب تفاصيل المنتج مع التوكن (withAuth: true)
          const { getProductDetails, reactToProduct } = await import("../services/product.service");
          await getProductDetails(id, true);
          // جلب تفاعل المستخدم الحالي
          const res = await fetch(`/api/products/${id}/reaction/`, { credentials: 'include' });
          const data = await res.json();
          setUserReaction(data.reaction_type || "neutral");
          setReactionCounts({
            likes: data.likes || 0,
            dislikes: data.dislikes || 0,
            neutrals: data.neutrals || 0
          });
          // تسجيل المشاهدة عند فتح الصفحة
          await reactToProduct(id, "neutral");
        } catch (e) { /* يمكن عرض رسالة خطأ */ }
      };
      fetchReaction();
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id])

  // جلب المراجعات عند تحميل الصفحة
  useEffect(() => {
    if (id) {
      fetch(`/api/reviews/?product=${id}`)
        .then(res => res.json())
        .then(data => setReviews(Array.isArray(data) ? data : (data.results || [])))
        .catch(() => setReviews([]));
    }
  }, [id]);

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(Number(id)))
  }

  const handleToggleCompare = () => {
    if (isInCompare) {
      dispatch(removeCompare(Number(id)))
    } else if (currentProduct) {
      dispatch(addCompare(currentProduct))
    }
  }

  // إضافة مراجعة جديدة
  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch(`/api/reviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ product: id, rating: reviewRating, comment: reviewText })
      });
      if (!res.ok) throw new Error("فشل إرسال المراجعة");
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      setReviewError("فشل إرسال المراجعة. تأكد من تسجيل الدخول.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (error || !currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading product. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="text-sm">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link to="/" className="text-gray-500 hover:text-[#005580]">
                  Home
                </Link>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="flex items-center">
                <Link to="/products" className="text-gray-500 hover:text-[#005580]">
                  Products
                </Link>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="text-[#005580]">{currentProduct.name}</li>
            </ol>
          </nav>
        </div>

        {/* Product Detail Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Images */}
            <div className="md:w-1/2">
              <div className="mb-4">
                <img
                  src={
                    (currentProduct.images && currentProduct.images[activeImage]) ||
                    currentProduct.image_url ||
                    currentProduct.image ||
                    "/placeholder.svg?height=400&width=500"
                  }
                  alt={currentProduct.name}
                  className="w-full h-80 object-contain"
                />
              </div>
              {currentProduct.images && currentProduct.images.length > 1 && (
                <div className="flex space-x-2">
                  {currentProduct.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`border p-2 rounded ${activeImage === index ? "border-[#005580]" : "border-gray-200"}`}
                    >
                      <img
                        src={img || "/placeholder.svg?height=50&width=50"}
                        alt={`${currentProduct.name} view ${index + 1}`}
                        className="w-16 h-16 object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2">
              <h1 className="text-2xl font-bold mb-2">{currentProduct.name}</h1>
              <p className="text-gray-600 mb-2">
                التصنيف: {currentProduct.category?.name || currentProduct.category_name || (typeof currentProduct.category === 'string' ? currentProduct.category : "بدون تصنيف")}
              </p>
              <p className="text-gray-600 mb-4">
                الماركة: {currentProduct.brand?.name || currentProduct.brand_name || (typeof currentProduct.brand === 'string' ? currentProduct.brand : "بدون ماركة")}
              </p>

              {/* Rating */}
              {currentProduct.reviews && currentProduct.reviews.length > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const averageRating =
                        currentProduct.reviews.reduce((sum, review) => sum + review.rating, 0) /
                        currentProduct.reviews.length
                      return (
                        <span key={star} className="text-yellow-400">
                          {star <= Math.round(averageRating) ? "★" : "☆"}
                        </span>
                      )
                    })}
                  </div>
                  <span className="ml-2 text-gray-600">
                    ({currentProduct.reviews.length} {currentProduct.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <span className="text-2xl font-bold">${currentProduct.price}</span>
                {currentProduct.discount && currentProduct.discount > 0 && (
                  <span className="ml-2 text-red-600">
                    <span className="line-through text-gray-500">
                      ${Math.round(currentProduct.price / (1 - currentProduct.discount / 100))}
                    </span>{" "}
                    ({currentProduct.discount}% OFF)
                  </span>
                )}
              </div>

              {/* Specifications */}
              <div className="border-t border-b py-4 my-4">
                {currentProduct.specifications ? (
                  Object.entries(currentProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center mb-2">
                      <span className="font-medium capitalize mr-2">{key.replace(/_/g, " ")}:</span>
                      <span>{value}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center mb-2">
                      <Monitor className="w-5 h-5 mr-2 text-gray-600" />
                      <span>Display: {currentProduct.display || "High-quality display"}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Cpu className="w-5 h-5 mr-2 text-gray-600" />
                      <span>Processor: {currentProduct.processor || "Latest processor"}</span>
                    </div>
                    <div className="flex items-center">
                      <MemoryStick className="w-5 h-5 mr-2 text-gray-600" />
                      <span>Memory: {currentProduct.memory || "Sufficient memory"}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleToggleFavorite}
                  className={`flex-1 py-3 rounded-md flex items-center justify-center transition-colors ${
                    isInFavorites
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[#005580] text-white hover:bg-[#004466]"
                  }`}
                >
                  <Heart className={`mr-2 ${isInFavorites ? "fill-current" : ""}`} size={20} />
                  {isInFavorites ? "SAVED TO FAVORITES" : "ADD TO FAVORITES"}
                </button>

                <button
                  onClick={handleToggleCompare}
                  className={`flex-1 py-3 rounded-md flex items-center justify-center transition-colors ${
                    isInCompare
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {isInCompare ? (
                    <>
                      <Check className="mr-2" size={20} />
                      ADDED TO COMPARE
                    </>
                  ) : (
                    <>
                      <BarChart2 className="mr-2" size={20} />
                      ADD TO COMPARE
                    </>
                  )}
                </button>
              </div>

              {/* Like/Dislike Buttons */}
              <div className="flex gap-4 mb-4 items-center">
                <button
                  onClick={async () => {
                    try {
                      await import("../services/product.service").then(({ reactToProduct }) => reactToProduct(currentProduct.id, "like"));
                      setUserReaction("like");
                      setReactionCounts(c => ({ ...c, likes: c.likes + 1, dislikes: userReaction === "dislike" ? c.dislikes - 1 : c.dislikes, neutrals: userReaction === "neutral" ? c.neutrals - 1 : c.neutrals }));
                    } catch (e) { alert("فشل تسجيل الإعجاب"); }
                  }}
                  className={`px-4 py-2 rounded transition-colors ${userReaction === "like" ? "bg-green-600 text-white" : "bg-green-500 text-white hover:bg-green-600"}`}
                >
                  👍 إعجاب ({reactionCounts.likes})
                </button>
                <button
                  onClick={async () => {
                    try {
                      await import("../services/product.service").then(({ reactToProduct }) => reactToProduct(currentProduct.id, "dislike"));
                      setUserReaction("dislike");
                      setReactionCounts(c => ({ ...c, dislikes: c.dislikes + 1, likes: userReaction === "like" ? c.likes - 1 : c.likes, neutrals: userReaction === "neutral" ? c.neutrals - 1 : c.neutrals }));
                    } catch (e) { alert("فشل تسجيل عدم الإعجاب"); }
                  }}
                  className={`px-4 py-2 rounded transition-colors ${userReaction === "dislike" ? "bg-red-600 text-white" : "bg-red-500 text-white hover:bg-red-600"}`}
                >
                  👎 عدم إعجاب ({reactionCounts.dislikes})
                </button>
                <span className="text-gray-500 text-sm">مشاهدات: {reactionCounts.neutrals}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="border-b mb-6">
            <div className="flex flex-wrap -mb-px">
              <button
                className={`mr-8 py-4 border-b-2 font-medium text-sm ${
                  activeTab === "description"
                    ? "border-[#005580] text-[#005580]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={`mr-8 py-4 border-b-2 font-medium text-sm ${
                  activeTab === "specifications"
                    ? "border-[#005580] text-[#005580]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("specifications")}
              >
                Specifications
              </button>
              <button
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === "reviews"
                    ? "border-[#005580] text-[#005580]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({currentProduct.reviews?.length || 0})
              </button>
            </div>
          </div>

          <div>
            {activeTab === "description" && (
              <div>
                <p className="text-gray-700">{currentProduct.description}</p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                {currentProduct.specifications ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(currentProduct.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/_/g, " ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-700">Detailed specifications not available for this product.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6 text-gray-500 text-center text-sm">
                {/* نموذج إضافة مراجعة */}
                <form onSubmit={handleAddReview} className="mb-6 bg-gray-50 p-4 rounded-lg flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span>تقييمك:</span>
                    {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewRating(star)} className={star <= reviewRating ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="اكتب تعليقك هنا..."
                    className="w-full max-w-md p-2 border rounded"
                    rows={2}
                    required
                  />
                  <button type="submit" disabled={reviewLoading} className="bg-[#005580] text-white px-4 py-2 rounded hover:bg-[#004466] mt-2">
                    {reviewLoading ? "جاري الإرسال..." : "إضافة مراجعة"}
                  </button>
                  {reviewError && <div className="text-red-500 text-xs mt-1">{reviewError}</div>}
                </form>
                {/* عرض المراجعات */}
                {reviews.length === 0 ? (
                  <div>لا توجد مراجعات بعد.</div>
                ) : (
                  <div className="space-y-4 w-full max-w-2xl mx-auto">
                    {reviews.map((r) => (
                      <div key={r.id} className="bg-white p-4 rounded shadow text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className={star <= (r.rating || 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
                          ))}
                          <span className="text-xs text-gray-400 ml-auto">{r.user?.username || r.user || "مستخدم"}</span>
                        </div>
                        <div className="text-gray-800 text-sm mb-1">{r.comment}</div>
                        <div className="text-xs text-gray-400">{r.created_at?.slice(0,10) || ""}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-[#005580] mr-2"></div>
            <h2 className="text-xl font-bold">Related Products</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
