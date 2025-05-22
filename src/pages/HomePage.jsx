"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllProducts, fetchNewProducts, fetchPopularProducts } from "../store/productSlice"
import HeroSection from "../sections/HeroSection"
import CategorySection from "../sections/CategorySection"
import ProductCard from "../components/ProductCard"
import FallbackLoader from "../components/FallbackLoader"
import { ArrowRight, AlertCircle } from "lucide-react"

// Home page component with hero, categories, and product sections
function HomePage() {
  const dispatch = useDispatch()
  const { allProducts, newProducts, popularProducts, loading, error } = useSelector((state) => state.products)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [dataFetched, setDataFetched] = useState(false)

  // Helper function to check if an object is a valid product
  const isValidProduct = (p) => {
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
  };

  // Function to retry loading products if there's an error
  const retryLoading = () => {
    console.log("Retrying product loading...")
    setPageLoading(true)
    setPageError(null)

    dispatch(fetchAllProducts())
      .then(() => Promise.all([
        dispatch(fetchNewProducts()),
        dispatch(fetchPopularProducts())
      ]))
      .then(() => {
        console.log("Products reloaded successfully")
        setDataFetched(true)
      })
      .catch(err => {
        console.error("Error reloading products:", err)
        setPageError("Failed to load products. Please try again.")
      })
      .finally(() => {
        setPageLoading(false)
      })
  }

  useEffect(() => {
    // Directly fetch all product types in parallel for better performance
    console.log("HomePage: Fetching all product data...")
    setPageLoading(true)

    // Create a function to handle the fetching
    const fetchAllProductData = async () => {
      try {
        // Dispatch all product fetching actions in parallel
        const results = await Promise.all([
          dispatch(fetchAllProducts()),
          dispatch(fetchNewProducts()),
          dispatch(fetchPopularProducts())
        ]);

        console.log("HomePage: All product data fetched successfully", results);

        // Check if we actually got data
        const productsState = results[0].payload;
        console.log("Products state:", productsState);

        if (
          (!productsState || (Array.isArray(productsState) && productsState.length === 0)) &&
          (!allProducts || allProducts.length === 0)
        ) {
          console.warn("No products data received from API");
          setPageError("No products found. The server might be experiencing issues.");
        } else {
          setDataFetched(true)
        }
      } catch (err) {
        console.error("HomePage: Error fetching products:", err);
        setPageError("Failed to load products. Please try again.");
      } finally {
        // Set loading to false regardless of success or failure
        setPageLoading(false);
      }
    };

    // Execute the fetch function
    fetchAllProductData();
  }, [dispatch])

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

  if (!pageLoading && !pageError && (!allProducts || allProducts.length === 0)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">No products available</h2>
          <p className="mb-4">No products were found. Please check your backend or try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Error message if needed */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-6 mx-4 rounded-md">
          <div className="flex justify-between items-center">
            <p>There was an issue loading some products. This won't affect your browsing experience.</p>
            <button
              onClick={retryLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
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
                  Array(4).fill({ id: 0, name: "Loading...", price: 0, image: "/placeholder.svg" }).map((product, index) => (
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
                  Array(4).fill({ id: 0, name: "Loading...", price: 0, image: "/placeholder.svg" }).map((product, index) => (
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

      {/* All Products Preview Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Explore All Products</h2>
            <Link to="/products" className="text-[#005580] hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading
              ? // Loading skeleton
                Array(4)
                  .fill()
                  .map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))
              : // Actual products - mix of new and popular
                // First check if we have any products at all
                (allProducts && allProducts.length > 0) ? (
                  // Use allProducts directly if we have them
                  allProducts
                    .filter(isValidProduct)
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard key={product.id || Math.random()} product={product} />
                    ))
                ) : (newProducts && newProducts.length > 0) || (popularProducts && popularProducts.length > 0) ? (
                  // If we have either new or popular products, combine them
                  [...(newProducts || []), ...(popularProducts || [])]
                    .filter(isValidProduct)
                    .filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard key={product.id || Math.random()} product={product} />
                    ))
                ) : loading ? (
                  // Still loading, show placeholders
                  Array(4).fill({ id: 0, name: "Loading...", price: 0, image: "/placeholder.svg" })
                    .map((product, index) => <ProductCard key={`loading-${index}`} product={product} />)
                ) : (
                  // No products and not loading, show message with retry button
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 p-8 bg-white rounded-lg shadow-sm text-center">
                    <p className="text-lg mb-4">Unable to load products at this time.</p>
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
    </div>
  )
}

export default HomePage
