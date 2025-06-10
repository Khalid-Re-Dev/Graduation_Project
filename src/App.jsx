"use client"

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { Routes, Route } from "react-router-dom"
import { fetchAllProducts } from "./store/productSlice"
import AuthProvider from "./components/AuthProvider"
import ErrorBoundary from "./components/ErrorBoundary"

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

// Main App component that sets up routing and initial data loading
function App() {
  const dispatch = useDispatch()
  const [productsLoaded, setProductsLoaded] = useState(false)

  // Load all products when the app starts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await dispatch(fetchAllProducts()).unwrap()
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setProductsLoaded(true)
      }
    }

    loadProducts()
  }, [dispatch])

  // Function to reload products data
  const reloadProducts = () => {
    console.log("Reloading products data...")
    dispatch(fetchAllProducts())
  }

  return (
    <ErrorBoundary
      fallbackTitle="Application Error"
      fallbackMessage="Sorry, something went wrong with the application. Please try again."
      onRefresh={reloadProducts}
    >
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <ErrorBoundary
                fallbackTitle="Home Page Error"
                fallbackMessage="There was a problem loading the home page. This might be due to a data loading issue."
                onRefresh={reloadProducts}
              >
                <HomePage />
              </ErrorBoundary>
            } />
            <Route path="compare" element={<ComparePage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="new-products" element={<NewProductsPage />} />
            <Route path="popular-products" element={<PopularProductsPage />} />
            <Route path="products" element={
              <ErrorBoundary
                fallbackTitle="Products Page Error"
                fallbackMessage="There was a problem loading the products page. This might be due to a data loading issue."
                onRefresh={reloadProducts}
              >
                <AllProductsPage />
              </ErrorBoundary>
            } />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="owner-dashboard" element={<OwnerDashboardPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
