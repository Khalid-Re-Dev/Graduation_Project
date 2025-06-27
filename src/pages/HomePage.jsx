"use client"

import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts, fetchNewProducts, fetchPopularProducts, selectProducts } from "../store/productSlice"
import { fetchRecommendations } from "../services/recommendations.service"
import HeroSection from "../sections/HeroSection"
import CategorySection from "../sections/CategorySection"
import ProductCard from "../components/ProductCard"
import FallbackLoader from "../components/FallbackLoader"
import { ArrowRight, AlertCircle } from "lucide-react"

// Home page component with hero, categories, and product sections
function HomePage() {
  const dispatch = useDispatch()
  const { 
    items: products,
    newProducts,
    popularProducts,
    loading,
    newProductsLoading,
    popularProductsLoading,
    error,
    newProductsError,
    popularProductsError
  } = useSelector(selectProducts)
  
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [dataFetched, setDataFetched] = useState(false)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Helper function to check if an object is a valid product
  const isValidProduct = useMemo(() => (p) => {
    const priceNum = Number(p.price);
    const valid = (
      p && typeof p === 'object' &&
      !('product_count' in p) &&
      typeof p.id !== 'undefined' && p.id !== null &&
      typeof p.name === 'string' && p.name.length > 0 &&
      !isNaN(priceNum) && priceNum >= 0
    );
    if (!valid) {
      console.warn('Filtered out non-product object:', p);
    }
    return valid;
  }, [])

  // Helper function to filter out duplicate products by id
  const filterUniqueProducts = (arr) => {
    const seen = new Set();
    return arr.filter((item) => {
      if (!item || !item.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  // Function to retry loading products if there's an error
  const retryLoading = async () => {
    console.log("Retrying product loading...")
    setPageLoading(true)
    setPageError(null)

    try {
      await Promise.all([
        dispatch(fetchProducts()).unwrap(),
        dispatch(fetchNewProducts(10)).unwrap(),
        dispatch(fetchPopularProducts(10)).unwrap()
      ])
      console.log("Products reloaded successfully")
      setDataFetched(true)
    } catch (err) {
      console.error("Error reloading products:", err)
      setPageError("Failed to load products. Please try again.")
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      if (dataFetched) return; // Skip if data is already fetched
      
      try {
        console.log('HomePage: Fetching all product data...');
        await Promise.all([
          dispatch(fetchProducts()).unwrap(),
          dispatch(fetchNewProducts(10)).unwrap(),
          dispatch(fetchPopularProducts(10)).unwrap(),
        ]);
        console.log('HomePage: All product data fetched successfully');
        setDataFetched(true);
      } catch (error) {
        console.error('HomePage: Error fetching product data:', error);
        setPageError("Failed to load products. Please try again.");
      } finally {
        setPageLoading(false);
      }
    };

    loadProducts();
  }, [dispatch, dataFetched]);

  // Helper function to render product grid
  const renderProductGrid = useMemo(() => (productList, loading, error, emptyMessage) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (!productList || productList.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productList.filter(isValidProduct).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }, [isValidProduct]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecommendations([]);
      return;
    }
    setRecommendationsLoading(true)
    setRecommendationsError(null)
    fetchRecommendations()
      .then((data) => {
        if (!Array.isArray(data)) {
          setRecommendationsError("No recommendations available.");
          setRecommendations([]);
          return;
        }
        setRecommendations(data);
        setRecommendationsError(null);
      })
      .catch((err) => {
        setRecommendationsError("Could not load recommendations. Please check your login or backend.")
        setRecommendations([])
      })
      .finally(() => setRecommendationsLoading(false))
  }, [isAuthenticated])

  // Show loading state
  if (pageLoading) {
    return <FallbackLoader message="Loading products..." fullPage={true} />
  }

  // Show error state
  if (pageError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Content</h2>
            <p className="mb-4">{pageError}</p>
            <button
              onClick={retryLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  // الزائر: فقط جميع المنتجات + رسالة وزر تسجيل الدخول
  if (!isAuthenticated) {
    // استخدم products بدلاً من allProducts
    const allProducts = products || [];
    return (
      <div>
        {/* إعلان صورة مع نص أعلى الصفحة */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 bg-blue-100 border-b border-blue-200 py-4 px-2 md:px-0">
          <img
            src="/best-in-click-logo.png"
            alt="إعلان ترويجي"
            className="w-24 h-24 object-contain rounded-lg shadow-md bg-white border border-blue-200"
          />
          <span className="text-lg md:text-xl font-bold text-blue-900 text-center md:text-right">
            احصل على خصم خاص لفترة محدودة على أفضل المنتجات! تسوق الآن واستفد من العروض.
          </span>
        </div>

        <HeroSection />
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Browse By Category</h2>
            </div>
            <CategorySection />
          </div>
        </section>
        <section className="py-8 bg-blue-50 border-b border-blue-100">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Sign in to unlock more features</h2>
            <p className="text-blue-800 mb-4 max-w-xl">
              To view <span className="font-semibold">popular</span>, <span className="font-semibold">new</span>, and <span className="font-semibold">recommended</span> products, please <Link to="/login" className="text-blue-700 underline hover:text-blue-900">log in</Link> or <Link to="/signup" className="text-blue-700 underline hover:text-blue-900">create an account</Link>.<br/>
              As a guest, you can browse all available products below.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-900 transition-colors font-bold text-lg"
            >
              Log In
            </Link>
          </div>
        </section>
        {/* All Products Section (vertical grid, like AllProductsPage) */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Products</h2>
              <Link to="/products" className="text-[#005580] hover:underline flex items-center">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.filter(isValidProduct).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // المستخدم المسجل دخوله: جميع الأقسام
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      {/* Categories Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Browse By Category</h2>
            <div className="flex space-x-2">
              <button className="p-2 border rounded-full hover:bg-gray-100">
                <ArrowRight className="rotate-180" size={16} />
              </button>
              <button className="p-2 border rounded-full hover:bg-gray-100">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <CategorySection />
        </div>
      </section>

      {/* New Products Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <Link to="/new-products" className="text-[#005580] hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="scroll-container">
            {loading
              ? // Loading skeleton
                Array(4)
                  .fill()
                  .map((_, index) => (
                    <div key={index} className="min-w-[250px] bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))
              : // Actual products
                (newProducts && newProducts.length > 0) ? (
                  // We have new products, display them
                  newProducts
                    .filter(isValidProduct)
                    .slice(0, 8)
                    .map((product) => (
                      <div key={product.id || Math.random()} className="min-w-[250px]">
                        <ProductCard product={product} />
                      </div>
                    ))
                ) : loading ? (
                  // Still loading, show placeholders
                  Array(4).fill({ name: "Loading...", price: "-", image: "/placeholder.svg" }).map((product, index) => (
                    <div key={`loading-${index}`} className="min-w-[250px]">
                      <ProductCard product={product} />
                    </div>
                  ))
                ) : (
                  // No products and not loading, show message with retry button
                  <div className="w-full p-8 bg-white rounded-lg shadow-sm text-center">
                    <p className="text-lg mb-4">Unable to load new products at this time.</p>
                    <button
                      onClick={retryLoading}
                      className="px-4 py-2 bg-[#005580] text-white rounded hover:bg-[#004466] transition-colors"
                    >
                      Retry Loading
                    </button>
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Products</h2>
            <Link to="/popular-products" className="text-[#005580] hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="scroll-container">
            {loading
              ? // Loading skeleton
                Array(4)
                  .fill()
                  .map((_, index) => (
                    <div key={index} className="min-w-[250px] bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))
              : // Actual products
                (popularProducts && popularProducts.length > 0) ? (
                  // We have popular products, display them
                  popularProducts
                    .filter(isValidProduct)
                    .slice(0, 8)
                    .map((product) => (
                      <div key={product.id || Math.random()} className="min-w-[250px]">
                        <ProductCard product={product} />
                      </div>
                    ))
                ) : loading ? (
                  // Still loading, show placeholders
                  Array(4).fill({ name: "Loading...", price: "-", image: "/placeholder.svg" }).map((product, index) => (
                    <div key={`loading-${index}`} className="min-w-[250px]">
                      <ProductCard product={product} />
                    </div>
                  ))
                ) : (
                  // No products and not loading, show message with retry button
                  <div className="w-full p-8 bg-white rounded-lg shadow-sm text-center">
                    <p className="text-lg mb-4">Unable to load popular products at this time.</p>
                    <button
                      onClick={retryLoading}
                      className="px-4 py-2 bg-[#005580] text-white rounded hover:bg-[#004466] transition-colors"
                    >
                      Retry Loading
                    </button>
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* Recommended for You Section */}
      <section className="bg-[#08597a] py-10 px-4">
        <div className="container mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-6">Recommended for You</h2>
          {recommendationsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(4).fill().map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recommendationsError && recommendationsError.toLowerCase().includes("login") ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-lg mb-4 text-blue-900 font-semibold">You must be logged in to see your personalized recommendations.</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-900 transition-colors font-bold text-lg"
              >
                Log In
              </Link>
            </div>
          ) : recommendationsError ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-lg mb-4 text-red-600">{recommendationsError}</p>
              <button
                onClick={() => {
                  setRecommendationsLoading(true)
                  setRecommendationsError(null)
                  fetchRecommendations()
                    .then((data) => {
                      if (Array.isArray(data.results)) {
                        setRecommendations(data.results);
                      } else {
                        setRecommendations([]);
                      }
                    })
                    .catch(() => setRecommendationsError("Could not load recommendations."))
                    .finally(() => setRecommendationsLoading(false))
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-900 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-lg mb-4">No recommendations available at this time.</p>
            </div>
          ) : (
            <div className="scroll-container">
              {recommendations.map((product) => (
                <div key={product.id} className="min-w-[250px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage