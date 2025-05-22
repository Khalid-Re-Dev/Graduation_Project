import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react"

// Footer component with company info, links, and newsletter signup
function Footer() {
  return (
    <footer className="bg-[#005580] text-white pt-10 pb-6">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Best on Click</h3>
          <p className="mb-2">Subscribe</p>
          <p className="mb-4">Get 10% off your first order</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 text-sm text-gray-800 bg-white rounded-l-md focus:outline-none w-full"
            />
            <button className="bg-[#005580] border border-white p-2 rounded-r-md hover:bg-[#004466]">
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-bold mb-4">Support</h3>
          <p className="mb-2">111 Bijoy sarani, Dhaka,</p>
          <p className="mb-2">DH 1515, Bangladesh.</p>
          <p className="mb-2">exclusive@gmail.com</p>
          <p className="mb-2">+88015-88888-9999</p>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-lg font-bold mb-4">Account</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/account" className="hover:underline">
                My Account
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">
                Login / Register
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:underline">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:underline">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/compare" className="hover:underline">
                Compare
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Link</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:underline">
                Terms Of Use
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Social Media & Copyright */}
      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-gray-600">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>© Copyright Rimel 2025. All right reserved</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-300">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
