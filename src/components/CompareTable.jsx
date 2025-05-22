"use client"

import { useSelector, useDispatch } from "react-redux"
import { removeFromCompare, clearCompare } from "../store/compareSlice"
import { addToCart } from "../store/cartSlice"
import { X, ShoppingCart, Check, Minus } from "lucide-react"

// Compare table component for displaying product comparisons
function CompareTable() {
  const dispatch = useDispatch()
  const compareItems = useSelector((state) => state.compare.items)

  if (compareItems.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <p className="text-lg mb-4">No products selected for comparison.</p>
        <p>Add products to compare by clicking the compare icon on product cards.</p>
      </div>
    )
  }

  // Get all unique specifications from all products
  const allSpecs = compareItems.reduce((specs, product) => {
    if (product.specifications) {
      Object.keys(product.specifications).forEach((key) => {
        if (!specs.includes(key)) {
          specs.push(key)
        }
      })
    }
    return specs
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Comparison</h2>
        <button
          onClick={() => dispatch(clearCompare())}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
              Feature
            </th>
            {compareItems.map((product) => (
              <th
                key={product.id}
                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="relative">
                  <button
                    onClick={() => dispatch(removeFromCompare(product.id))}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                  >
                    <X size={14} />
                  </button>
                  {product.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Image row */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Image</td>
            {compareItems.map((product) => (
              <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <img
                  src={product.image || "/placeholder.svg?height=100&width=100"}
                  alt={product.name}
                  className="w-24 h-24 object-contain mx-auto"
                />
              </td>
            ))}
          </tr>

          {/* Price row */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Price</td>
            {compareItems.map((product) => (
              <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-bold">${product.price}</div>
                {product.discount > 0 && <div className="text-xs text-red-600">{product.discount}% OFF</div>}
              </td>
            ))}
          </tr>

          {/* Category row */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Category</td>
            {compareItems.map((product) => (
              <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.category}
              </td>
            ))}
          </tr>

          {/* Stock row */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Availability</td>
            {compareItems.map((product) => (
              <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.stock > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <Check size={16} className="mr-1" /> In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <X size={16} className="mr-1" /> Out of Stock
                  </span>
                )}
              </td>
            ))}
          </tr>

          {/* Description row */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Description</td>
            {compareItems.map((product) => (
              <td key={product.id} className="px-6 py-4 text-sm text-gray-500">
                {product.description}
              </td>
            ))}
          </tr>

          {/* Specifications rows */}
          {allSpecs.map((spec) => (
            <tr key={spec}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                {spec.replace(/_/g, " ")}
              </td>
              {compareItems.map((product) => (
                <td key={product.id} className="px-6 py-4 text-sm text-gray-500">
                  {product.specifications && product.specifications[spec] ? (
                    product.specifications[spec]
                  ) : (
                    <Minus size={16} className="text-gray-400" />
                  )}
                </td>
              ))}
            </tr>
          ))}

          {/* Actions row */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Actions</td>
            {compareItems.map((product) => (
              <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => dispatch(addToCart({ ...product, quantity: 1 }))}
                  className="bg-[#005580] text-white py-2 px-4 rounded flex items-center justify-center hover:bg-[#004466] transition-colors"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Add to Cart
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default CompareTable
