"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import CompareTable from "../components/CompareTable"
import ProductCard from "../components/ProductCard"
import { Search, Filter } from "lucide-react"

// Compare page for product comparison
function ComparePage() {
  const dispatch = useDispatch()
  const { allProducts, loading } = useSelector((state) => state.products)
  const compareItems = useSelector((state) => state.compare.items)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Get all unique categories
  const categories = [...new Set(allProducts.map((product) => product.category))]

  // Filter products based on search and category
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "" || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Check if product is already in compare
  const isInCompare = (productId) => {
    return compareItems.some((item) => item.id === productId)
  }

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
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array(8)
              .fill()
              .map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            // Actual products
            filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </div>
    </div>
  )
}

export default ComparePage
