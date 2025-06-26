import { Link } from "react-router-dom"
import { Smartphone, Laptop, Watch, Camera, Headphones, Gamepad } from "lucide-react"

// Categories with icons
const categories = [
  { id: 1, name: "Phones", icon: Smartphone, path: "/products?category=phones" },
  { id: 2, name: "Computers", icon: Laptop, path: "/products?category=computers" },
  { id: 3, name: "SmartWatch", icon: Watch, path: "/products?category=smartwatch" },
  { id: 4, name: "Camera", icon: Camera, path: "/products?category=camera" },
  { id: 5, name: "HeadPhones", icon: Headphones, path: "/products?category=headphones" },
  { id: 6, name: "Gaming", icon: Gamepad, path: "/products?category=gaming" },
]

// Category section with icons and labels
function CategorySection() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Browse Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[#005580] hover:shadow-md transition-all duration-200 min-h-[120px] group"
            >
              <category.icon className="w-8 h-8 mb-3 text-gray-800 group-hover:text-[#005580] transition" />
              <span className="text-base font-semibold text-gray-900 mt-1">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
