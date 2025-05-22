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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={category.path}
          className="flex flex-col items-center justify-center p-4 border rounded-md hover:border-[#005580] transition-colors"
        >
          <category.icon className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">{category.name}</span>
        </Link>
      ))}
    </div>
  )
}

export default CategorySection
