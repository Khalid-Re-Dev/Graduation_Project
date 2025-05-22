"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { login } from "../store/authSlice"
import { Eye, EyeOff } from "lucide-react"

// Login page component
function LoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      // Call the API through Redux action
      const result = await dispatch(login(credentials)).unwrap()

      if (result && result.user) {
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
      console.error("Login error:", err)
      setError(err || "Invalid email or password. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2">Log in to Best On Click</h1>
          <p className="text-gray-600 mb-8">Enter your details below</p>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

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
              <div></div>
              <Link to="/forgot-password" className="text-[#005580] hover:underline text-sm">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#005580] text-white py-3 rounded-md hover:bg-[#004466] transition-colors"
            >
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
