"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import CompareTable from "../components/CompareTable"
import ProductCard from "../components/ProductCard"
import { Search, Filter } from "lucide-react"
import { fetchCompare, compareProducts } from "../store/compareSlice"

// Compare page for product comparison
function ComparePage() {
  const dispatch = useDispatch()
  const { allProducts, loading } = useSelector((state) => state.products)
  const { items: compareItems, loading: compareLoading, error: compareError } = useSelector((state) => state.compare)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [comparisonResult, setComparisonResult] = useState(null)
  const [comparisonLoading, setComparisonLoading] = useState(false)
  const [comparisonError, setComparisonError] = useState(null)

  // Get all unique categories (as objects)
  const categories = [
    ...new Map(
      allProducts
        .map((product) => {
          const cat = product.category;
          if (!cat) return null;
          if (typeof cat === "object" && cat !== null) {
            return { id: cat.id, name: cat.name };
          }
          // إذا كان نصًا أو رقمًا
          return { id: cat, name: cat };
        })
        .filter(Boolean)
        .map((cat) => [cat.id, cat]) // استخدم id كمفتاح
    ).values(),
  ]

  // Filter products based on search and category
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())

    // استخراج قيمة التصنيف للمقارنة
    let productCategory = product.category;
    let productCategoryId = productCategory;
    if (typeof productCategory === "object" && productCategory !== null) {
      productCategoryId = productCategory.id;
    }
    const matchesCategory = selectedCategory === "" || productCategoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  })

  // Check if product is already in compare
  const isInCompare = (productId) => {
    return compareItems.some((item) => item.id === productId)
  }

  const handleCompare = async () => {
    setComparisonLoading(true)
    setComparisonError(null)
    setComparisonResult(null)
    try {
      const productIds = compareItems.map((item) => item.id)
      const res = await dispatch(compareProducts(productIds)).unwrap()
      setComparisonResult(res)
    } catch (err) {
      setComparisonError(err.message || "Failed to compare products")
    } finally {
      setComparisonLoading(false)
    }
  }

  useEffect(() => {
    dispatch(fetchCompare())
  }, [dispatch])

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Compare Products</h1>

        {/* Compare Table */}
        <div className="mb-8">
          <CompareTable />
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products to compare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div className="md:w-64">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580] appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {compareLoading && (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-blue-200 border-t-[#005580] rounded-full"></div>
            <h2 className="text-2xl font-bold mb-4">Loading comparison list...</h2>
          </div>
        )}
        {compareError && (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold mb-4">Error loading comparison list</h2>
            <p className="mb-6 text-red-600">{compareError}</p>
          </div>
        )}
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Compare Button */}
        <div className="mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
            onClick={handleCompare}
            disabled={compareItems.length < 2 || comparisonLoading}
          >
            {comparisonLoading ? "Comparing..." : "قارن المنتجات"}
          </button>
          {comparisonError && <div className="text-red-600 mt-2">{comparisonError}</div>}
          {comparisonResult && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
              <h3 className="font-bold mb-2">نتيجة المقارنة من الخادم:</h3>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(comparisonResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComparePage
