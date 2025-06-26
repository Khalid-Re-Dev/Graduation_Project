import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { checkAuth } from "../store/authSlice"

/**
 * AuthProvider component
 * Checks authentication status on app load and provides auth state to the app
 */
function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await dispatch(checkAuth()).unwrap()
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setAuthCheckComplete(true)
      }
    }

    checkAuthentication()
  }, [dispatch])

  // Show loading indicator while checking authentication
  if (loading && !authCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#005580] border-r-[#005580] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return children
}

export default AuthProvider
