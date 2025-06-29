import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, loading } = useSelector((state) => state.auth)

  // If still loading auth state, show nothing (AuthProvider will show loading state)
  if (loading) {
    return null
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // If authenticated, render children
  return children
}

export default ProtectedRoute 