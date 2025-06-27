"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../store/productSlice";
import { toggleFavorite } from "../store/favoritesSlice";
import { addCompare, removeCompare } from "../store/compareSlice";
import {
  Heart,
  Monitor,
  Cpu,
  MemoryStick,
  BarChart2,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import ProductCard from "../components/ProductCard";

// Lazy load product service for reactions
const ProductService = import("../services/product.service");

/**
 * Renders the detailed view of a single product, including its information,
 * specifications, user reviews, and related products.
 */
function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentProduct, relatedProducts, loading, error } = useSelector(
    (state) => state.products
  );
  const compareItems = useSelector((state) => state.compare.items);
  const favoriteItems = useSelector((state) => state.favorites.items);

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  // User interaction state (likes, dislikes, views)
  const [userReaction, setUserReaction] = useState("neutral");
  const [reactionCounts, setReactionCounts] = useState({
    likes: 0,
    dislikes: 0,
    neutrals: 0,
  });

  // Review submission state
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Check if the current product is in compare or favorites lists
  const isInCompare = compareItems.some((item) => item.id === Number(id));
  const isInFavorites = favoriteItems.some((item) => item.id === Number(id));

  /**
   * Fetches product details and user's reaction upon component mount or ID change.
   */
  useEffect(() => {
    if (!id) return;

    // Fetch product details from Redux store
    dispatch(fetchProductById(id));

    // Fetch user reaction and track view
    const fetchUserReactionAndTrackView = async () => {
      try {
        const { getProductDetails, reactToProduct } = await ProductService;
        // Optionally fetch product details with auth if needed by the service
        await getProductDetails(id, true);

        // Fetch current user's reaction for this product
        const response = await fetch(`/api/products/${id}/reaction/`, {
          credentials: "include",
        });
        const data = await response.json();
        setUserReaction(data.reaction_type || "neutral");
        setReactionCounts({
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          neutrals: data.neutrals || 0,
        });

        // Register a view (neutral reaction)
        await reactToProduct(id, "neutral");
      } catch (e) {
        console.error("Failed to fetch user reaction or track view:", e);
        // Handle error gracefully, e.g., show a toast notification
      }
    };

    fetchUserReactionAndTrackView();
  }, [dispatch, id]); // Dependencies: dispatch and product ID

  /**
   * Fetches product reviews upon component mount or ID change.
   */
  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/?product=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews.");
        }
        const data = await response.json();
        // Ensure data is an array or has a results property that is an array
        setReviews(Array.isArray(data) ? data : data.results || []);
      } catch (e) {
        console.error("Failed to fetch reviews:", e);
        setReviews([]); // Clear reviews on error
        // Optionally, set a reviewError state here for user feedback
      }
    };

    fetchReviews();
  }, [id]); // Dependency: product ID

  /**
   * Handles toggling the product in/out of favorites.
   */
  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(Number(id)));
  }, [dispatch, id]);

  /**
   * Handles toggling the product in/out of the comparison list.
   */
  const handleToggleCompare = useCallback(() => {
    if (isInCompare) {
      dispatch(removeCompare(Number(id)));
    } else if (currentProduct) {
      dispatch(addCompare(currentProduct));
    }
  }, [dispatch, id, isInCompare, currentProduct]);

  /**
   * Handles user reactions (like/dislike) for the product.
   * @param {('like' | 'dislike')} reactionType - The type of reaction.
   */
  const handleUserReaction = useCallback(
    async (reactionType) => {
      try {
        const { reactToProduct } = await ProductService;
        await reactToProduct(Number(id), reactionType);

        // Update local state based on the reaction
        setReactionCounts((prevCounts) => {
          const newCounts = { ...prevCounts };
          if (reactionType === "like") {
            newCounts.likes += 1;
            if (userReaction === "dislike") newCounts.dislikes -= 1;
          } else {
            newCounts.dislikes += 1;
            if (userReaction === "like") newCounts.likes -= 1;
          }
          // If previous reaction was neutral, decrement neutral count
          if (userReaction === "neutral") newCounts.neutrals -= 1;
          return newCounts;
        });
        setUserReaction(reactionType);
      } catch (e) {
        console.error(`Failed to record ${reactionType} reaction:`, e);
        alert(
          `فشل تسجيل ${
            reactionType === "like" ? "الإعجاب" : "عدم الإعجاب"
          }.`
        );
      }
    },
    [id, userReaction]
  );

  /**
   * Handles adding a new review for the product.
   * @param {Event} e - The form submission event.
   */
  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(""); // Clear previous errors

    try {
      const response = await fetch(`/api/reviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with the request
        body: JSON.stringify({
          product: id,
          rating: reviewRating,
          comment: reviewText,
        }),
      });

      if (!response.ok) {
        // Attempt to parse error message from response body
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.detail || errorData.message || "فشل إرسال المراجعة";
        throw new Error(errorMessage);
      }

      const newReview = await response.json();
      setReviews([newReview, ...reviews]); // Add new review to the top
      setReviewText(""); // Clear review text field
      setReviewRating(5); // Reset rating
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(
        err.message || "فشل إرسال المراجعة. تأكد من تسجيل الدخول."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="bg-gray-300 h-80 w-full rounded-lg"></div>
            </div>
            <div className="md:w-1/2">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading product. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating =
    currentProduct.reviews && currentProduct.reviews.length > 0
      ? currentProduct.reviews.reduce((sum, review) => sum + review.rating, 0) /
        currentProduct.reviews.length
      : 0;

  // --- Main Component Render ---
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
                <Link
                  to="/products"
                  className="text-gray-500 hover:text-[#005580]"
                >
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
                    (currentProduct.images &&
                      currentProduct.images[activeImage]) ||
                    currentProduct.image_url ||
                    currentProduct.image ||
                    "/placeholder.svg?height=400&width=500"
                  }
                  alt={currentProduct.name}
                  className="w-full h-80 object-contain"
                />
              </div>
              {currentProduct.images && currentProduct.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {currentProduct.images.map((img, index) => (
                    <button
                      type="button" // Specify type for buttons
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`border p-2 rounded transition-all duration-200 ease-in-out ${
                        activeImage === index
                          ? "border-[#005580] ring-2 ring-[#005580]"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
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
              <h1 className="text-2xl font-bold mb-2">
                {currentProduct.name}
              </h1>
              <p className="text-gray-600 mb-2">
                **Category**:{" "}
                {currentProduct.category?.name ||
                  currentProduct.category_name ||
                  (typeof currentProduct.category === "string"
                    ? currentProduct.category
                    : "Uncategorized")}
              </p>
              <p className="text-gray-600 mb-4">
                **Brand**:{" "}
                {currentProduct.brand?.name ||
                  currentProduct.brand_name ||
                  (typeof currentProduct.brand === "string"
                    ? currentProduct.brand
                    : "No Brand")}
              </p>

              {/* Rating Display */}
              {currentProduct.reviews && currentProduct.reviews.length > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">
                        {star <= Math.round(averageRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    ({currentProduct.reviews.length}{" "}
                    {currentProduct.reviews.length === 1
                      ? "review"
                      : "reviews"}
                    )
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <span className="text-2xl font-bold">
                  ${currentProduct.price.toFixed(2)}
                </span>{" "}
                {/* Format price to 2 decimal places */}
                {currentProduct.discount && currentProduct.discount > 0 && (
                  <span className="ml-2 text-red-600">
                    <span className="line-through text-gray-500">
                      $
                      {(
                        currentProduct.price /
                        (1 - currentProduct.discount / 100)
                      ).toFixed(2)}
                    </span>{" "}
                    ({currentProduct.discount}% OFF)
                  </span>
                )}
              </div>

              {/* Specifications - Display only if available, otherwise placeholders */}
              <div className="border-t border-b py-4 my-4">
                {currentProduct.specifications ? (
                  Object.entries(currentProduct.specifications).map(
                    ([key, value]) => (
                      <div key={key} className="flex items-center mb-2">
                        <span className="font-medium capitalize mr-2">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span>{value}</span>
                      </div>
                    )
                  )
                ) : (
                  <>
                    <div className="flex items-center mb-2">
                      <Monitor className="w-5 h-5 mr-2 text-gray-600" />
                      <span>
                        Display: {currentProduct.display || "High-quality display"}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Cpu className="w-5 h-5 mr-2 text-gray-600" />
                      <span>
                        Processor: {currentProduct.processor || "Latest processor"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MemoryStick className="w-5 h-5 mr-2 text-gray-600" />
                      <span>
                        Memory: {currentProduct.memory || "Sufficient memory"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`flex-1 py-3 rounded-md flex items-center justify-center transition-colors ${
                    isInFavorites
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[#005580] text-white hover:bg-[#004466]"
                  }`}
                >
                  <Heart
                    className={`mr-2 ${isInFavorites ? "fill-current" : ""}`}
                    size={20}
                  />
                  {isInFavorites ? "SAVED TO FAVORITES" : "ADD TO FAVORITES"}
                </button>

                <button
                  type="button"
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
              <div className="flex gap-4 mt-4 items-center">
                <button
                  type="button"
                  onClick={() => handleUserReaction("like")}
                  className={`p-2 rounded-full bg-white shadow transition hover:scale-110 flex items-center justify-center ${
                    userReaction === "like"
                      ? "text-green-600"
                      : "text-gray-400 hover:text-green-600"
                  }`}
                  style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)" }}
                  aria-label="Like this product"
                >
                  <ThumbsUp size={20} className={userReaction === "like" ? "fill-current" : ""} />
                  <span className="ml-1 text-xs text-gray-700 font-medium">
                    {reactionCounts.likes}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUserReaction("dislike")}
                  className={`p-2 rounded-full bg-white shadow transition hover:scale-110 flex items-center justify-center ${
                    userReaction === "dislike"
                      ? "text-red-600"
                      : "text-gray-400 hover:text-red-600"
                  }`}
                  style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)" }}
                  aria-label="Dislike this product"
                >
                  <ThumbsDown size={20} className={userReaction === "dislike" ? "fill-current" : ""} />
                  <span className="ml-1 text-xs text-gray-700 font-medium">
                    {reactionCounts.dislikes}
                  </span>
                </button>
                <span className="text-gray-500 text-sm mr-2">
                  Views: {reactionCounts.neutrals}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Product Tabs Section --- */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="border-b mb-6">
            <div className="flex flex-wrap -mb-px">
              <button
                type="button"
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
                type="button"
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
                type="button"
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === "reviews"
                    ? "border-[#005580] text-[#005580]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({reviews.length || 0})
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(currentProduct.specifications).map(
                          ([key, value]) => (
                            <tr key={key}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                {key.replace(/_/g, " ")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {value}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-700">
                    Detailed specifications are not available for this product.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6 text-gray-500 text-center text-sm">
                {/* Add Review Form */}
                <form
                  onSubmit={handleAddReview}
                  className="mb-6 bg-gray-50 p-4 rounded-lg flex flex-col items-center gap-2"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Leave a Review
                  </h3>
                  <div className="flex items-center gap-2">
                    <span>Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl ${
                          star <= reviewRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        aria-label={`Rate ${star} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your comment here..."
                    className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
                    rows={3} // Increased rows for better usability
                    required
                    aria-label="Review comment"
                  />
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-[#005580] text-white px-6 py-2 rounded-md hover:bg-[#004466] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewLoading ? "Submitting..." : "Add Review"}
                  </button>
                  {reviewError && (
                    <div className="text-red-500 text-xs mt-1">
                      {reviewError}
                    </div>
                  )}
                </form>

                {/* Display Reviews */}
                {reviews.length === 0 ? (
                  <div className="text-gray-600">No reviews yet.</div>
                ) : (
                  <div className="space-y-4 w-full max-w-2xl mx-auto">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-4 rounded-lg shadow-sm text-right border border-gray-200"
                      >
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          {/* User name on the right in Arabic context */}
                          <span className="text-xs text-gray-500">
                            {r.user?.username || r.user || "Anonymous User"}
                          </span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= (r.rating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <div className="text-gray-800 text-sm mb-1 text-right">
                          {r.comment}
                        </div>
                        <div className="text-xs text-gray-400 text-left">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString()
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- Related Products Section --- */}
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
  );
}

export default ProductDetailPage;