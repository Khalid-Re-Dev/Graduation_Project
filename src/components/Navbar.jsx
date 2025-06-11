"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../store/authSlice"
import { ShoppingCart, Heart, Search, Menu, X, ListOrdered, UserCircle } from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"

// Navbar component with search, favorites, and navigation
function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)
  const favoritesCount = useSelector((state) => state.favorites.items.length)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-4 group min-w-[56px]">
          <div className="w-12 h-12 bg-transparent flex items-center justify-center">
            <img src="/best-in-click-logo.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-sm" loading="eager" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight whitespace-nowrap">Best on Click</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-base font-medium text-gray-900 hover:text-[#005580] transition-colors px-2 py-1">Home</Link>
          <Link to="/products" className="text-base font-medium text-gray-900 hover:text-[#005580] transition-colors px-2 py-1">Products</Link>
          <Link to="/favorites" className="text-base font-medium text-gray-900 hover:text-[#005580] transition-colors px-2 py-1">Favorites</Link>
          <Link to="/compare" className="text-base font-medium text-gray-900 hover:text-[#005580] transition-colors px-2 py-1">Compare</Link>
          {auth.isAuthenticated ? (
            <button onClick={handleLogout} className="text-base font-medium text-gray-900 hover:text-[#005580] transition-colors px-2 py-1 bg-transparent border-none">Logout</button>
          ) : (
            <Link to="/signup" className="text-base font-medium text-gray-900 hover:text-[#005580] transition-colors px-2 py-1">Sign Up</Link>
          )}
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center w-[320px] bg-white border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[#005580] transition">
          <input
            type="text"
            placeholder="What are you looking for?"
            className="flex-1 px-4 py-2 text-gray-900 bg-transparent outline-none placeholder:text-gray-400 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="p-2 text-gray-500 hover:text-[#005580] transition">
            <Search size={18} />
          </button>
        </form>

        {/* Icons */}
        <div className="hidden md:flex items-center gap-3 ml-2 relative">
          <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100 transition group">
            <Heart size={22} className="text-gray-900 group-hover:text-[#005580]" />
          </Link>
          <Link to="/compare" className="relative p-2 rounded-full hover:bg-gray-100 transition group">
            <ListOrdered size={22} className="text-gray-900 group-hover:text-[#005580]" />
          </Link>
          {auth.isAuthenticated && (
            <Link to="/profile" className="relative p-2 rounded-full hover:bg-gray-100 transition group">
              <UserCircle size={24} className="text-gray-900 group-hover:text-[#005580]" />
            </Link>
          )}
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition group"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Show notifications"
          >
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" /></svg>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-12 z-50">
              <NotificationDropdown />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded hover:bg-gray-100 text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm pt-20 px-4 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-2 text-center">
              <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-[#005580] py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" className="text-lg font-semibold text-gray-900 hover:text-[#005580] py-2" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <Link to="/favorites" className="text-lg font-semibold text-gray-900 hover:text-[#005580] py-2" onClick={() => setMobileMenuOpen(false)}>Favorite</Link>
              <Link to="/compare" className="text-lg font-semibold text-gray-900 hover:text-[#005580] py-2" onClick={() => setMobileMenuOpen(false)}>Compare</Link>
              {auth.isAuthenticated ? (
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="text-lg font-semibold text-gray-900 hover:text-[#005580] py-2 bg-transparent border-none w-full text-left">Logout</button>
              ) : (
                <Link to="/signup" className="text-lg font-semibold text-gray-900 hover:text-[#005580] py-2" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              )}
            </div>
            <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[#005580] transition">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-2 text-gray-900 bg-transparent outline-none placeholder:text-gray-400 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="p-2 text-gray-500 hover:text-[#005580] transition">
                <Search size={18} />
              </button>
            </form>
            <div className="flex items-center justify-center gap-6 mt-2">
              <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100 transition group" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={22} className="text-gray-900 group-hover:text-[#005580]" />
              </Link>
              <Link to="/compare" className="relative p-2 rounded-full hover:bg-gray-100 transition group" onClick={() => setMobileMenuOpen(false)}>
                <ListOrdered size={22} className="text-gray-900 group-hover:text-[#005580]" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
