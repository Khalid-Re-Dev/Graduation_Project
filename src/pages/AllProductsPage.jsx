"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { fetchProducts } from "../store/productSlice"
import ProductCard from "../components/ProductCard"
import FallbackLoader from "../components/FallbackLoader"
import { Filter, Grid3X3, Grid2X2, Search, AlertCircle, RefreshCw } from "lucide-react"

// All products page with filtering and sorting options
function AllProductsPage() {
  const dispatch = useDispatch()
  const { allProducts, loading, error } = useSelector((state) => state.products)
  const [searchParams] = useSearchParams()
  const [filteredProducts, setFilteredProducts] = useState([])
  const [gridView, setGridView] = useState("grid-4") // grid-4 or grid-3

  // Page state
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [dataFetched, setDataFetched] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: [0, 2000],
    rating: 0,
  })

  // Sort state
  const [sortOption, setSortOption] = useState("newest")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  // Function to load products with proper error handling
  const loadProducts = async () => {
    setPageLoading(true)
    setPageError(null)

    try {
      console.log("AllProductsPage: Loading products...")
      const result = await dispatch(fetchProducts()).unwrap()

      console.log("AllProductsPage: Products loaded:", result ? result.length : 0)

      if (!result || (Array.isArray(result) && result.length === 0)) {
        if (allProducts.length === 0) {
          console.warn("No products data received")
          setPageError("No products found. The server might be experiencing issues.")
        } else {
          // We have products in the store already
          setDataFetched(true)
        }
      } else {
        setDataFetched(true)
      }
    } catch (err) {
      console.error("Error loading products:", err)
      setPageError("Failed to load products. Please try again.")
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    // Fetch products when the component mounts
    loadProducts()

    // Set up an interval to retry fetching if products are empty
    const retryInterval = setInterval(() => {
      if (allProducts.length === 0 && !loading && !pageError) {
        console.log("No products found, retrying fetch...")
        loadProducts()
      } else if (allProducts.length > 0) {
        // Clear interval once we have products
        clearInterval(retryInterval)
      }
    }, 8000) // Retry every 8 seconds

    // Clean up interval on component unmount
    return () => clearInterval(retryInterval)
  }, [dispatch])

  // Helper to get numeric price
  const getPrice = (p) => {
    if (typeof p.price === 'number') return p.price;
    if (typeof p.price === 'string' && !isNaN(Number(p.price))) return Number(p.price);
    return NaN;
  };

  // Helper function to check if an object is a valid product
  const isValidProduct = (p) => {
    const priceNum = getPrice(p);
    const valid = (
      p && typeof p === 'object' &&
      !('product_count' in p) &&
      typeof p.id !== 'undefined' && p.id !== null &&
      typeof p.name === 'string' && p.name.length > 0 &&
      typeof priceNum === 'number' && !isNaN(priceNum) && priceNum >= 0
    );
    if (!valid) {
      console.warn('Filtered out non-product object:', p);
    }
    return valid;
  };

  useEffect(() => {
    if (allProducts.length > 0) {
      let result = [...allProducts];

      // Apply category filter
      if (filters.category) {
        result = result.filter((product) => {
          if (typeof product.category === 'object' && product.category && product.category.name) {
            return product.category.name.toLowerCase() === filters.category.toLowerCase();
          }
          return (product.category || '').toLowerCase() === filters.category.toLowerCase();
        });
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (product) =>
            (typeof product.name === 'string' && product.name.toLowerCase().includes(query)) ||
            (typeof product.description === 'string' && product.description.toLowerCase().includes(query)) ||
            (typeof product.category === 'object' && product.category && product.category.name && product.category.name.toLowerCase().includes(query)) ||
            ((typeof product.category === 'string' || typeof product.category === 'number') && String(product.category).toLowerCase().includes(query))
        );
      }

      // Apply price range filter (use getPrice)
      result = result.filter(
        (product) => {
          const priceNum = getPrice(product);
          return priceNum >= filters.priceRange[0] && priceNum <= filters.priceRange[1];
        }
      );

      // Apply rating filter
      if (filters.rating > 0) {
        result = result.filter((product) => {
          if (!product.reviews || product.reviews.length === 0) return false;
          const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
          return avgRating >= filters.rating;
        });
      }

      // Apply sorting (use getPrice)
      if (sortOption === "newest") {
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortOption === "price-low") {
        result.sort((a, b) => getPrice(a) - getPrice(b));
      } else if (sortOption === "price-high") {
        result.sort((a, b) => getPrice(b) - getPrice(a));
      } else if (sortOption === "popular") {
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      }

      // Filter out invalid products
      setFilteredProducts(result.filter(isValidProduct));
    }
  }, [allProducts, filters, sortOption, searchQuery])

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({ ...prev, category }))
  }

  const handlePriceChange = (range) => {
    setFilters((prev) => ({ ...prev, priceRange: range }))
  }

  const handleRatingChange = (rating) => {
    setFilters((prev) => ({ ...prev, rating }))
  }

  const handleSortChange = (option) => {
    setSortOption(option)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Update the search query state
    setSearchQuery(e.target.search.value)
  }

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
            <h2 className="text-xl font-bold mb-2">Error Loading Products</h2>
            <p className="mb-4">{pageError}</p>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Products</h1>
          <button
            onClick={() => {
              console.log("Debug - Current state:", {
                allProducts: allProducts.length,
                filteredProducts: filteredProducts.length,
                loading,
                filters,
                sortOption,
                searchQuery
              });
              // Force refresh products
              loadProducts();
            }}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh Products
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Filter size={20} className="mr-2" />
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>

            {/* Search Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Search</h3>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search products..."
                    defaultValue={searchQuery}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#005580]">
                    Go
                  </button>
                </div>
              </form>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === ""}
                    onChange={() => handleCategoryChange("")}
                    className="mr-2"
                  />
                  All Categories
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === "phones"}
                    onChange={() => handleCategoryChange("phones")}
                    className="mr-2"
                  />
                  Phones
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === "computers"}
                    onChange={() => handleCategoryChange("computers")}
                    className="mr-2"
                  />
                  Computers
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === "smartwatch"}
                    onChange={() => handleCategoryChange("smartwatch")}
                    className="mr-2"
                  />
                  SmartWatch
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === "camera"}
                    onChange={() => handleCategoryChange("camera")}
                    className="mr-2"
                  />
                  Camera
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === "headphones"}
                    onChange={() => handleCategoryChange("headphones")}
                    className="mr-2"
                  />
                  HeadPhones
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === "gaming"}
                    onChange={() => handleCategoryChange("gaming")}
                    className="mr-2"
                  />
                  Gaming
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === "electronics"}
                    onChange={() => handleCategoryChange("electronics")}
                    className="mr-2"
                  />
                  Electronics
                </label>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center justify-between mb-2">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange([filters.priceRange[0], Number.parseInt(e.target.value)])}
                className="w-full"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-medium mb-2">Rating</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === 0}
                    onChange={() => handleRatingChange(0)}
                    className="mr-2"
                  />
                  All Ratings
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === 4}
                    onChange={() => handleRatingChange(4)}
                    className="mr-2"
                  />
                  4+ Stars
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === 3}
                    onChange={() => handleRatingChange(3)}
                    className="mr-2"
                  />
                  3+ Stars
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="w-full md:w-3/4">
            {/* Sort and View Options */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <label className="mr-2">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Popularity</option>
                </select>
              </div>

              <div className="flex items-center">
                <span className="mr-2">View:</span>
                <button
                  onClick={() => setGridView("grid-4")}
                  className={`p-1 rounded ${gridView === "grid-4" ? "bg-gray-200" : ""}`}
                >
                  <Grid2X2 size={20} />
                </button>
                <button
                  onClick={() => setGridView("grid-3")}
                  className={`p-1 rounded ml-2 ${gridView === "grid-3" ? "bg-gray-200" : ""}`}
                >
                  <Grid3X3 size={20} />
                </button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8)
                  .fill()
                  .map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-lg mb-4">No products found matching your criteria.</p>
                {/* إظهار زر Reset Filters فقط إذا كان هناك فلتر مفعل */}
                {(filters.category || filters.rating > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 2000 || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilters({
                        category: "",
                        priceRange: [0, 2000],
                        rating: 0,
                      });
                      setSearchQuery("");
                      setSortOption("newest");
                      dispatch(fetchProducts());
                    }}
                    className="px-4 py-2 bg-[#005580] text-white rounded hover:bg-[#004466] transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  gridView === "grid-4" ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"
                } gap-6`}
              >
                {filteredProducts
                  .filter(isValidProduct)
                  .map((product) => {
                    console.log('Rendering ProductCard (all-products):', product);
                    return <ProductCard key={product.id} product={product} />;
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllProductsPage
