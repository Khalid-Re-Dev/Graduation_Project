"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { ShoppingCart, Heart, Search, Menu, X, Star } from "lucide-react"

// Navbar component with search, favorites, and navigation
function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const favoritesCount = useSelector((state) => state.favorites.items.length)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav className="bg-[#005580] text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Heart className="text-[#005580] w-6 h-6 fill-red-500" />
          </div>
          <span className="text-xl font-bold">Best On Click</span>
        </Link>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-200 transition-colors">
            Home
          </Link>
          <Link to="/products" className="hover:text-gray-200 transition-colors">
            Products
          </Link>
          <Link to="/favorites" className="hover:text-gray-200 transition-colors">
            Favorites
          </Link>
          <Link to="/compare" className="hover:text-gray-200 transition-colors">
            Compare
          </Link>
          <Link to="/login" className="hover:text-gray-200 transition-colors">
            Login
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center bg-white rounded-md overflow-hidden">
          <input
            type="text"
            placeholder="What are you looking for?"
            className="px-4 py-2 w-64 text-gray-800 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="bg-white p-2 text-gray-600 hover:text-gray-800">
            <Search size={20} />
          </button>
        </div>

        {/* Icons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/favorites" className="hover:text-gray-200 relative">
            <Heart size={24} />
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ffb700] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </Link>
          <Link to="/compare" className="hover:text-gray-200 relative">
            <Star size={24} />
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-[#005580] pt-16 px-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-xl py-2 border-b border-blue-400" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link
                to="/products"
                className="text-xl py-2 border-b border-blue-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/favorites"
                className="text-xl py-2 border-b border-blue-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favorites
              </Link>
              <Link
                to="/compare"
                className="text-xl py-2 border-b border-blue-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Compare
              </Link>
              <Link
                to="/login"
                className="text-xl py-2 border-b border-blue-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-4">
                <div className="flex items-center bg-white rounded-md overflow-hidden">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    className="px-4 py-2 w-full text-gray-800 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="bg-white p-2 text-gray-600 hover:text-gray-800">
                    <Search size={20} />
                  </button>
                </div>
              </form>

              {/* Mobile Icons */}
              <div className="flex items-center space-x-6 mt-4 justify-center">
                <Link to="/favorites" className="flex flex-col items-center relative" onClick={() => setMobileMenuOpen(false)}>
                  <Heart size={24} />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ffb700] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                  <span className="text-sm mt-1">Favorites</span>
                </Link>
                <Link
                  to="/compare"
                  className="flex flex-col items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Star size={24} />
                  <span className="text-sm mt-1">Compare</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
