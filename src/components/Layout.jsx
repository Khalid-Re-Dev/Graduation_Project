import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"

// Layout component that wraps all pages with common elements
function Layout() {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate checking if resources are loaded
  useEffect(() => {
    // Set a timeout to ensure the loading state is shown for at least a short time
    // This helps prevent flickering if resources load very quickly
    const timer = setTimeout(() => {
      setIsLoading(false)
      console.log("Layout loading complete")
    }, 500) // Reduced from 1000ms to 500ms for faster loading

    return () => clearTimeout(timer)
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-[#005580] border-r-[#005580] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading content...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
