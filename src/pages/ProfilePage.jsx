// صفحة البروفايل للمستخدم المسجل
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import ProductCard from "../components/ProductCard"

function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const favorites = useSelector((state) => state.favorites.items)
  const navigate = useNavigate()

  if (!isAuthenticated) {
    navigate("/login")
    return null
  }

  return (
    <div className="bg-gradient-to-b from-[#eaf6fb] to-gray-50 min-h-[90vh] py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* بطاقة البروفايل */}
        <div className="relative bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center mb-12 border border-gray-100 animate-fade-in">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg p-1 border-4 border-[#005580] animate-pop-in">
            <img
              src={user?.profile_image || "/placeholder-user.jpg"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>
          <div className="mt-28 text-center w-full">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight animate-fade-in-slow">{user?.full_name || user?.username || user?.email}</h2>
            <p className="text-gray-500 mb-4 animate-fade-in-slow delay-100">{user?.email}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-4 animate-fade-in-slow delay-200">
              <div className="flex-1 bg-gradient-to-r from-[#eaf6fb] to-white rounded-lg p-6 text-center shadow border border-gray-100">
                <div className="text-4xl font-extrabold text-[#005580] drop-shadow">{favorites.length}</div>
                <div className="text-gray-700 mt-1 font-medium">Favorite Products</div>
              </div>
              {/* يمكن إضافة المزيد من الإحصائيات هنا */}
            </div>
            <button className="mt-8 px-8 py-2 bg-[#005580] text-white rounded-lg font-bold shadow hover:bg-[#004466] transition-all duration-150 animate-fade-in-slow delay-300">Edit Profile</button>
          </div>
        </div>
        {/* قائمة المنتجات المفضلة */}
        <div className="animate-fade-in-slow delay-200">
          <h3 className="text-2xl font-bold mb-6 text-[#005580] tracking-tight">Your Favorite Products</h3>
          {favorites.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500 shadow">No favorite products yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
