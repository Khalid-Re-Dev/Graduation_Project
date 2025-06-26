"use client"

import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts, fetchNewProducts, fetchPopularProducts, selectProducts } from "../store/productSlice"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <CategorySection />
      <div className="container mx-auto px-4 py-8">
        {/* All Products Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">All Products</h2>
          {renderProductGrid(
            products,
            loading,
            error,
            'No products available. Please check back later.'
          )}
        </section>

        {/* New Products Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
          {renderProductGrid(
            newProducts,
            newProductsLoading,
            newProductsError,
            'No new products available at the moment.'
          )}
        </section>

        {/* Popular Products Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Products</h2>
          {renderProductGrid(
            popularProducts,
            popularProductsLoading,
            popularProductsError,
            'No popular products available at the moment.'
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage
