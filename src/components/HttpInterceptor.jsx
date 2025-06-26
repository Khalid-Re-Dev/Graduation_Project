import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../store/authSlice"
import { API_BASE_URL } from "../config/api.config"

/**
 * HttpInterceptor component
 * Intercepts HTTP requests and handles authentication errors
 */
function HttpInterceptor() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    // Original fetch function
    const originalFetch = window.fetch

    // Helper to check if refresh token exists
    const hasRefreshToken = () => {
      try {
        return !!localStorage.getItem("refresh_token") || !!sessionStorage.getItem("refresh_token")
      } catch {
        return false
      }
    }

    // Helper to check if URL is for a public route
    const isPublicRoute = (url) => {
      return ["/login", "/signup", "/products", "/", "/new", "/popular"].some(route => 
        typeof url === "string" && url.includes(route)
      )
    }

    // Override fetch to add auth token and handle errors
    window.fetch = async (url, options = {}) => {
      // Only intercept requests to our API
      if (url.startsWith(API_BASE_URL) || url.startsWith("/api")) {
        // Add auth token to headers if authenticated
        if (isAuthenticated && token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          }
        }

        try {
          // Make the request
          const response = await originalFetch(url, options)

          // Handle 401 Unauthorized errors
          if (response.status === 401 && !isPublicRoute(url)) {
            // If we have a refresh token, let the auth service handle refresh
            // Otherwise, logout and redirect to login
            if (!hasRefreshToken()) {
              await dispatch(logout())
              navigate("/login", { state: { from: window.location.pathname } })
            }
          }

          return response
        } catch (error) {
          console.error("Fetch error:", error)
          throw error
        }
      }

      // For non-API requests, use original fetch
      return originalFetch(url, options)
    }

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch
    }
  }, [dispatch, token, isAuthenticated, navigate])

  // This component doesn't render anything
  return null
}

export default HttpInterceptor
