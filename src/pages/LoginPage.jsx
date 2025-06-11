"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { login, clearError } from "../store/authSlice"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"
import { fetchFavorites } from "../store/favoritesSlice"

// Login page component
function LoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error: reduxError } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
    setError("")
    if (reduxError) dispatch(clearError())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      // Call the API through Redux action
      const result = await dispatch(login({ ...credentials, rememberMe })).unwrap()

      if (result && result.user) {
        // مزامنة مفضلة الزائر مع السيرفر بعد تسجيل الدخول
        const guestFavorites = JSON.parse(sessionStorage.getItem('guest_favorites') || '[]')
        if (guestFavorites.length > 0) {
          for (const product of guestFavorites) {
            // Use toggleFavorite to sync guest favorites with backend
            await dispatch(toggleFavorite(product.id))
          }
          sessionStorage.removeItem('guest_favorites')
          // بعد المزامنة، جلب المفضلة من السيرفر
          await dispatch(fetchFavorites())
        }
        // Redirect to dashboard if user is admin, otherwise to owner dashboard or home page
        if (result.user.is_admin || result.user.is_staff) {
          navigate("/dashboard")
        } else if (result.user.user_type === "owner") {
          navigate("/owner-dashboard")
        } else {
          navigate("/")
        }
      } else {
        navigate("/")
      }
    } catch (err) {
      let msg = err || "Invalid email or password. Please try again."
      // Network/CORS error detection
      if (typeof msg === "string" && (msg.includes("Network") || msg.includes("CORS") || msg.includes("Failed to fetch"))) {
        msg = "تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت أو حاول لاحقًا."
        toast.error(msg)
      } else if (typeof msg === "string" && (msg.includes("server") || msg.includes("response"))) {
        msg = "حدث خطأ في الخادم. حاول لاحقًا أو تواصل مع الدعم."
        toast.error(msg)
      }
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-[#005580]">Log in to Best On Click</h1>
          <p className="text-gray-600 mb-8">Enter your details below</p>

          {(error || reduxError) && (
            <div className="bg-red-50 border border-red-300 text-[#b91c1c] px-4 py-3 rounded mb-4 flex items-center gap-2 animate-fade-in">
              <svg className="w-5 h-5 text-[#b91c1c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
              <span>{error || reduxError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                name="email"
                placeholder="Email or Phone Number"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                required
              />
            </div>

            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-[#005580]"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-[#005580] hover:underline text-sm">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#005580] text-white py-3 rounded-md hover:bg-[#004466] transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
              Log in
            </button>
          </form>

          <p className="mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#005580] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block md:w-1/2 bg-[#005580] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#005580]">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
            <div className="relative z-10">
              <img src="/placeholder.svg?height=600&width=400" alt="Tech devices" className="w-full" />
            </div>
          </div>
          <div className="absolute inset-0 bg-[#005580] opacity-90 z-0">
            <div className="absolute inset-0 transform rotate-45">
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
