import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react"

// Footer component with company info, links, and newsletter signup
function Footer() {
  return (
    <footer className="bg-[#08597a] text-white pt-12 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-bold mb-3 tracking-tight">Best on Click</h3>
          <p className="mb-1 text-base font-semibold">Subscribe</p>
          <p className="mb-3 text-sm text-white/80">Get 10% off your first order</p>
          <form className="flex items-center max-w-xs">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 text-sm text-white bg-[#0d6a8a] border border-white/30 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/60 w-full"
            />
            <button className="bg-white text-[#08597a] p-2 rounded-r-md border border-white/30 hover:bg-[#0d6a8a] hover:text-white transition">
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xl font-bold mb-3 tracking-tight">Support</h3>
          <p className="mb-1 text-sm">111 Bijoy sarani, Dhaka,</p>
          <p className="mb-1 text-sm">DH 1515, Bangladesh.</p>
          <p className="mb-1 text-sm">exclusive@gmail.com</p>
          <p className="mb-1 text-sm">+88015-88888-9999</p>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-xl font-bold mb-3 tracking-tight">Account</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/account" className="hover:text-white/80 transition text-base">My Account</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white/80 transition text-base">Login / Register</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white/80 transition text-base">Cart</Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-white/80 transition text-base">Wishlist</Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-white/80 transition text-base">Shop</Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-3 tracking-tight">Quick Link</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy-policy" className="hover:text-white/80 transition text-base">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms-of-use" className="hover:text-white/80 transition text-base">Terms Of Use</Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white/80 transition text-base">FAQ</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white/80 transition text-base">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Download App & Social */}
        <div className="flex flex-col items-start gap-3">
          <h3 className="text-xl font-bold mb-3 tracking-tight">Download App</h3>
          <p className="mb-2 text-sm text-white/80">Save $3 with App New User Only</p>
          <div className="flex items-center justify-center w-24 h-24 bg-white rounded-lg mb-4">
            {/* QR Code Placeholder */}
            <svg className="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="8" fill="#e5e7eb"/>
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="14" fill="#9ca3af">QR</text>
            </svg>
          </div>
          <div className="flex gap-3 mt-2">
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white"><Facebook size={20} /></a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white"><Twitter size={20} /></a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white"><Instagram size={20} /></a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto px-4 mt-10 pt-6 border-t border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/70">© Copyright Rimel 2025. All right reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
