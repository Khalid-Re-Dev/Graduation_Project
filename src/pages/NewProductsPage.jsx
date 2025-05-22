"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNewProducts } from "../store/productSlice"
import ProductCard from "../components/ProductCard"

// New products page showing latest products
function NewProductsPage() {
  const dispatch = useDispatch()
  const { newProducts, loading } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchNewProducts())
  }, [dispatch])

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">New Arrivals</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewProductsPage
