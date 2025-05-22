"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchAllProducts } from "../store/productSlice"
import { BarChart, PieChart, Edit, Trash2, Plus, Star, Loader2, AlertCircle } from "lucide-react"
import { getStats, getProducts, createProduct, updateProduct, deleteProduct, getAnalytics } from "../services/dashboard.service"
import { getUsers } from "../services/user.service"
import { isAdmin, isAuthenticated as checkAuth } from "../services/auth.service"

// Dashboard page for admin functionality
function DashboardPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  // State for API data
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])

  // UI state
  const [activeTab, setActiveTab] = useState("products")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Loading and error states
  const [loading, setLoading] = useState({
    products: false,
    stats: false,
    analytics: false,
    users: false,
  })
  const [error, setError] = useState({
    products: null,
    stats: null,
    analytics: null,
    users: null,
  })

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    discount: "",
    image: "",
  })

  // Check authentication
  const isAuthenticated = checkAuth()
  const isUserAdmin = isAdmin()

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }))
    setError(prev => ({ ...prev, products: null }))

    try {
      const data = await getProducts()
      setProducts(data.results || data)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(prev => ({ ...prev, products: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }

  // Fetch dashboard stats from API
  const fetchStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }))
    setError(prev => ({ ...prev, stats: null }))

    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError(prev => ({ ...prev, stats: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, stats: false }))
    }
  }

  // Fetch analytics data from API
  const fetchAnalytics = async () => {
    setLoading(prev => ({ ...prev, analytics: true }))
    setError(prev => ({ ...prev, analytics: null }))

    try {
      const data = await getAnalytics()
      setAnalyticsData(data)
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError(prev => ({ ...prev, analytics: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }))
    }
  }

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }))
    setError(prev => ({ ...prev, users: null }))

    try {
      const data = await getUsers()
      setUsers(data.results || data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(prev => ({ ...prev, users: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  // Extract reviews from products
  const extractReviews = (products) => {
    const allReviews = products.reduce((reviews, product) => {
      if (product.reviews && product.reviews.length > 0) {
        return [
          ...reviews,
          ...product.reviews.map((review) => ({
            ...review,
            productId: product.id,
            productName: product.name,
          })),
        ]
      }
      return reviews
    }, [])

    // Sort reviews by date (newest first)
    return [...allReviews].sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // Load data based on active tab
  useEffect(() => {
    if (!isAuthenticated || !isUserAdmin) return

    fetchProducts()

    if (activeTab === "analytics") {
      fetchStats()
      fetchAnalytics()
    }

    if (activeTab === "reviews") {
      // Reviews are extracted from products
      if (products.length === 0) {
        fetchProducts()
      } else {
        setReviews(extractReviews(products))
      }
    }
  }, [activeTab, isAuthenticated, isUserAdmin])

  // Redirect if not authenticated or not admin (in a real app)
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>You must be logged in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  // In a real app, check if user is admin
  if (user && !user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle adding a new product
  const handleAddProduct = async (e) => {
    e.preventDefault()

    setLoading(prev => ({ ...prev, products: true }))
    setError(prev => ({ ...prev, products: null }))

    try {
      // Convert price and other numeric values
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        discount: parseInt(formData.discount, 10) || 0,
      }

      await createProduct(productData)

      // Refresh products list
      fetchProducts()

      // Reset form
      setShowAddForm(false)
      setFormData({
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "",
        discount: "",
        image: "",
      })
    } catch (err) {
      console.error("Error adding product:", err)
      setError(prev => ({ ...prev, products: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }

  // Set up form for editing a product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      stock: product.stock || 0,
      discount: product.discount || 0,
      image: product.image || "",
    })
    setShowAddForm(true)
  }

  // Handle updating an existing product
  const handleUpdateProduct = async (e) => {
    e.preventDefault()

    setLoading(prev => ({ ...prev, products: true }))
    setError(prev => ({ ...prev, products: null }))

    try {
      // Convert price and other numeric values
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        discount: parseInt(formData.discount, 10) || 0,
      }

      await updateProduct(editingProduct.id, productData)

      // Refresh products list
      fetchProducts()

      // Reset form
      setShowAddForm(false)
      setEditingProduct(null)
      setFormData({
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "",
        discount: "",
        image: "",
      })
    } catch (err) {
      console.error("Error updating product:", err)
      setError(prev => ({ ...prev, products: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }

  // Handle deleting a product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    setLoading(prev => ({ ...prev, products: true }))
    setError(prev => ({ ...prev, products: null }))

    try {
      await deleteProduct(productId)

      // Refresh products list
      fetchProducts()
    } catch (err) {
      console.error("Error deleting product:", err)
      setError(prev => ({ ...prev, products: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }

  // Use extracted reviews
  const sortedReviews = reviews

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab("products")}
                      className={`w-full text-left px-4 py-2 rounded-md ${activeTab === "products" ? "bg-[#005580] text-white" : "hover:bg-gray-100"}`}
                    >
                      Products
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("analytics")}
                      className={`w-full text-left px-4 py-2 rounded-md ${activeTab === "analytics" ? "bg-[#005580] text-white" : "hover:bg-gray-100"}`}
                    >
                      Analytics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`w-full text-left px-4 py-2 rounded-md ${activeTab === "reviews" ? "bg-[#005580] text-white" : "hover:bg-gray-100"}`}
                    >
                      Reviews
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Manage Products</h2>
                  <button
                    onClick={() => {
                      setShowAddForm(true)
                      setEditingProduct(null)
                      setFormData({
                        name: "",
                        price: "",
                        category: "",
                        description: "",
                        stock: "",
                        discount: "",
                      })
                    }}
                    className="bg-[#005580] text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Product
                  </button>
                </div>

                {showAddForm && (
                  <div className="mb-8 p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                    <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Product Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Price ($)</label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="Phones">Phones</option>
                            <option value="Computers">Computers</option>
                            <option value="SmartWatch">SmartWatch</option>
                            <option value="Camera">Camera</option>
                            <option value="HeadPhones">HeadPhones</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Electronics">Electronics</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Stock</label>
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Discount (%)</label>
                          <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                          rows="3"
                          required
                        ></textarea>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="bg-[#005580] text-white px-4 py-2 rounded-md">
                          {editingProduct ? "Update Product" : "Add Product"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Error Message */}
                {error.products && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    <span>Error: {error.products}</span>
                  </div>
                )}

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading.products
                        ? Array(5)
                            .fill()
                            .map((_, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 bg-gray-300 rounded-md animate-pulse"></div>
                                    <div className="ml-4">
                                      <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 w-10 bg-gray-300 rounded animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                                </td>
                              </tr>
                            ))
                        : products.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                No products found
                              </td>
                            </tr>
                          ) : (
                            products.map((product) => (
                              <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <img
                                      src={product.image || "/placeholder.svg?height=40&width=40"}
                                      alt={product.name}
                                      className="h-10 w-10 rounded-md object-cover"
                                    />
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{product.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">${product.price}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{product.stock || "N/A"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditProduct(product)}
                                      className="text-blue-600 hover:text-blue-900"
                                      disabled={loading.products}
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="text-red-600 hover:text-red-900"
                                      disabled={loading.products}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                    </tbody>
                  </table>
                </div>

                {/* Loading Indicator */}
                {loading.products && (
                  <div className="flex justify-center mt-4">
                    <Loader2 className="animate-spin text-[#005580]" size={24} />
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Product Analytics</h2>

                {/* Error Message */}
                {(error.stats || error.analytics) && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    <span>Error: {error.stats || error.analytics}</span>
                  </div>
                )}

                {/* Loading Indicator */}
                {(loading.stats || loading.analytics) && (
                  <div className="flex justify-center my-8">
                    <Loader2 className="animate-spin text-[#005580]" size={32} />
                  </div>
                )}

                {!loading.stats && !error.stats && stats && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Total Products</h3>
                        <p className="text-3xl font-bold">{stats.total_products || products.length}</p>
                        <p className="text-sm text-green-600">
                          {stats.product_growth ? `+${stats.product_growth}% from last month` : ""}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Total Reviews</h3>
                        <p className="text-3xl font-bold">{stats.total_reviews || reviews.length}</p>
                        <p className="text-sm text-green-600">
                          {stats.review_growth ? `+${stats.review_growth}% from last month` : ""}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Average Rating</h3>
                        <p className="text-3xl font-bold flex items-center">
                          {stats.average_rating ?
                            stats.average_rating.toFixed(1) :
                            reviews.length > 0
                              ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                              : "0.0"}
                          <Star size={20} className="ml-1 text-yellow-400 fill-yellow-400" />
                        </p>
                        <p className="text-sm text-green-600">
                          {stats.rating_growth ? `+${stats.rating_growth}% from last month` : ""}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {!loading.analytics && !error.analytics && analyticsData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Products by Category</h3>
                      <div className="flex items-center justify-center h-64">
                        {analyticsData.category_distribution ? (
                          <div className="w-full">
                            {Object.entries(analyticsData.category_distribution).map(([category, count], index) => (
                              <div key={index} className="mb-2">
                                <div className="flex justify-between mb-1">
                                  <span>{category}</span>
                                  <span>{count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-[#005580] h-2.5 rounded-full"
                                    style={{ width: `${(count / stats.total_products) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <PieChart size={200} />
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Monthly Activity</h3>
                      <div className="flex items-center justify-center h-64">
                        {analyticsData.monthly_activity ? (
                          <div className="w-full">
                            {Object.entries(analyticsData.monthly_activity).map(([month, count], index) => (
                              <div key={index} className="mb-2">
                                <div className="flex justify-between mb-1">
                                  <span>{month}</span>
                                  <span>{count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-[#005580] h-2.5 rounded-full"
                                    style={{ width: `${(count / Math.max(...Object.values(analyticsData.monthly_activity))) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <BarChart size={200} />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>

                {/* Loading Indicator */}
                {loading.products && (
                  <div className="flex justify-center my-8">
                    <Loader2 className="animate-spin text-[#005580]" size={32} />
                  </div>
                )}

                {/* Error Message */}
                {error.products && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    <span>Error: {error.products}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {!loading.products && !error.products && sortedReviews.length === 0 ? (
                    <p className="text-center text-gray-500">No reviews yet.</p>
                  ) : (
                    sortedReviews.map((review, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{review.user || review.username || "Anonymous"}</div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Reviewed: {review.productName || (review.product ? review.product.name : "Unknown Product")}
                        </p>
                        <p className="text-gray-700 mb-2">{review.comment || review.content || review.text}</p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-gray-500">
                            {new Date(review.date || review.created_at || review.timestamp || Date.now()).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              className="text-[#005580] text-sm hover:underline"
                              onClick={() => {
                                // In a real implementation, this would open a reply form or modal
                                alert(`Reply to review from ${review.user || review.username || "Anonymous"}`)
                              }}
                            >
                              Reply
                            </button>
                            <button
                              className="text-red-600 text-sm hover:underline"
                              onClick={() => {
                                // In a real implementation, this would call an API to delete the review
                                if (window.confirm("Are you sure you want to delete this review?")) {
                                  alert(`Review deleted (this is a placeholder - would connect to API in production)`)
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
