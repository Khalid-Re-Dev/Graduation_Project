"use client"

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { fetchProducts } from "./store/productSlice"
import AuthProvider from "./components/AuthProvider"
import ErrorBoundary from "./components/ErrorBoundary"
import NotificationProvider from "./components/NotificationProvider"
import ProtectedRoute from "./components/ProtectedRoute"

// Layout and Pages
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import ComparePage from "./pages/ComparePage"
import FavoritesPage from "./pages/FavoritesPage"
import NewProductsPage from "./pages/NewProductsPage"
import PopularProductsPage from "./pages/PopularProductsPage"
import AllProductsPage from "./pages/AllProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import DashboardPage from "./pages/DashboardPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import NotFoundPage from "./pages/NotFoundPage"
import OwnerDashboardPage from "./pages/OwnerDashboardPage"
import ProfilePage from "./pages/ProfilePage"
import ProductUpsert from "./pages/dashboard/ProductUpsert"
import ErrorExplanationPage from "./pages/ErrorExplanationPage"

// Main App component that sets up routing and initial data loading
function App() {
  const dispatch = useDispatch()
  const [productsLoaded, setProductsLoaded] = useState(false)

  // Load all products when the app starts
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(fetchProducts()).unwrap()
      } catch (error) {
        console.error("Error initializing app:", error)
      } finally {
        setProductsLoaded(true)
      }
    }

    initializeApp()
  }, [dispatch])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<AllProductsPage />} />
              <Route path="/new" element={<NewProductsPage />} />
              <Route path="/popular" element={<PopularProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
            </Route>

            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route element={<Layout />}>
              <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/products/new" element={<ProtectedRoute><ProductUpsert /></ProtectedRoute>} />
              <Route path="/dashboard/products/:id/edit" element={<ProtectedRoute><ProductUpsert /></ProtectedRoute>} />
              <Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboardPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
            {/* صفحة شرح الأخطاء */}
            <Route path="/error-explanation" element={<ErrorExplanationPage />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App