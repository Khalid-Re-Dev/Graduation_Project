"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchProductById } from "../store/productSlice"
import { addFavorite, removeFavorite } from "../store/favoritesSlice"
import { addCompare, removeCompare } from "../store/compareSlice"
import { Heart, Minus, Plus, Monitor, Cpu, MemoryStick, BarChart2, Check } from "lucide-react"
import ProductCard from "../components/ProductCard"
import ReviewList from "../components/ReviewList"
import ReviewForm from "../components/ReviewForm"

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

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id))
    }
  }, [dispatch, id])

  const handleToggleFavorite = () => {
    if (isInFavorites) {
      dispatch(removeFavorite(Number(id)))
    } else if (currentProduct) {
      dispatch(addFavorite(currentProduct))
    }
  }

  const handleToggleCompare = () => {
    if (isInCompare) {
      dispatch(removeCompare(Number(id)))
    } else if (currentProduct) {
      dispatch(addCompare(currentProduct))
    }
  }

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
    )
  }

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
                    currentProduct.images?.[activeImage] ||
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
              <p className="text-gray-600 mb-4">{currentProduct.category}</p>

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
              <div className="space-y-6">
                <ReviewList reviews={currentProduct.reviews} />
                <ReviewForm productId={currentProduct.id} />
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
