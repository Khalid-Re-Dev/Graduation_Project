"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { register } from "../store/authSlice"
import { Eye, EyeOff } from "lucide-react"

// Signup page component
function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "customer", // Default to customer
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate username (required)
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    // Validate email (required)
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Validate password (required)
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Validate user type
    if (!formData.userType) {
      newErrors.userType = "Please select a user type"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    try {
      // Prepare user data for API - only include fields expected by the backend
      const userData = {
        username: formData.username, // Required by backend
        email: formData.email,       // Required by backend
        password: formData.password, // Required by backend
        password2: formData.confirmPassword, // Required by backend
        user_type: formData.userType, // Optional, with default in backend
      }

      // All required fields are included in userData object

      // Call the API through Redux action
      const result = await dispatch(register(userData)).unwrap()

      if (result && result.user) {
        // Show success message
        alert("Registration successful!")

        // Redirect based on user type
        if (formData.userType === "owner") {
          // If user is an owner, redirect to owner dashboard
          navigate("/owner-dashboard")
        } else {
          // If user is a customer, redirect to login page
          navigate("/login")
        }
      } else {
        navigate("/")
      }
    } catch (err) {
      console.error("Registration error:", err)

      // Handle API validation errors
      if (err && typeof err === 'object') {
        const apiErrors = {}

        // Map API error fields to form fields
        if (err.username) apiErrors.username = err.username[0]
        if (err.email) apiErrors.email = err.email[0]
        if (err.password) apiErrors.password = err.password[0]
        if (err.password2) apiErrors.confirmPassword = err.password2[0]
        if (err.user_type) apiErrors.userType = err.user_type[0]

        // If we have specific field errors, show them
        if (Object.keys(apiErrors).length > 0) {
          setErrors({ ...apiErrors })
        } else {
          // Otherwise show a general error
          setErrors({ general: err.message || "Registration failed. Please try again." })
        }
      } else {
        setErrors({ general: "Registration failed. Please try again." })
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-gray-600 mb-8">Enter your details below to create your account</p>
          <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-md border border-blue-100">
            <strong>Note:</strong> Only the required fields are shown. You can update your profile with additional information after registration.
          </p>

          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.username ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              {!errors.username && <p className="text-gray-500 text-xs mt-1">Username can only contain letters, numbers, and underscores</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border rounded-md p-4 cursor-pointer flex items-center ${
                    formData.userType === "customer"
                      ? "border-[#005580] bg-blue-50 shadow-sm"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleChange({ target: { name: "userType", value: "customer" } })}
                >
                  <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                    formData.userType === "customer" ? "border-[#005580]" : "border-gray-400"
                  }`}>
                    {formData.userType === "customer" && (
                      <div className="w-3 h-3 rounded-full bg-[#005580]"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Customer</p>
                    <p className="text-xs text-gray-500">Shop for products</p>
                  </div>
                </div>

                <div
                  className={`border rounded-md p-4 cursor-pointer flex items-center ${
                    formData.userType === "owner"
                      ? "border-[#005580] bg-blue-50 shadow-sm"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleChange({ target: { name: "userType", value: "owner" } })}
                >
                  <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                    formData.userType === "owner" ? "border-[#005580]" : "border-gray-400"
                  }`}>
                    {formData.userType === "owner" && (
                      <div className="w-3 h-3 rounded-full bg-[#005580]"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Owner</p>
                    <p className="text-xs text-gray-500">Manage your business</p>
                  </div>
                </div>
              </div>
              {errors.userType && <p className="text-red-500 text-xs mt-1">{errors.userType}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {!errors.password && <p className="text-gray-500 text-xs mt-1">Password must be at least 6 characters</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#005580] text-white py-3 rounded-md hover:bg-[#004466] transition-colors"
            >
              Create Account
            </button>

            <div className="mt-4">
              <button
                type="button"
                className="w-full border border-gray-300 py-3 rounded-md flex items-center justify-center hover:bg-gray-50"
              >
                <img src="/placeholder.svg?height=20&width=20" alt="Google" className="w-5 h-5 mr-2" />
                Sign up with Google
              </button>
            </div>
          </form>

          <p className="mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-[#005580] hover:underline">
              Log in
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

export default SignupPage
