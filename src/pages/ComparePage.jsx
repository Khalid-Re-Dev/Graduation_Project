"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import ProductCard from "../components/ProductCard"
import { Search, Filter } from "lucide-react"

// دالة مقارنة المنتجات عبر الباك (توجيه للباكند على Render)
async function compareProductsAPI(productIds, token) {
  const response = await fetch("https://binc-b.onrender.com/api/comparison/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ product_ids: productIds }),
  });
  if (!response.ok) throw new Error("فشل في جلب بيانات المقارنة");
  return await response.json();
}

function ComparePage() {
  const { allProducts, loading } = useSelector((state) => state.products)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [comparison, setComparison] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState(null)

  // جلب التصنيفات الفريدة
  const categories = [
    ...new Map(
      allProducts
        .map((product) => {
          const cat = product.category;
          if (!cat) return null;
          if (typeof cat === "object" && cat !== null) {
            return { id: cat.id, name: cat.name };
          }
          return { id: cat, name: cat };
        })
        .filter(Boolean)
        .map((cat) => [cat.id, cat])
    ).values(),
  ]

  // تصفية المنتجات
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())

    let productCategory = product.category;
    let productCategoryId = productCategory;
    if (typeof productCategory === "object" && productCategory !== null) {
      productCategoryId = productCategory.id;
    }
    const matchesCategory = selectedCategory === "" || productCategoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  })


  // إضافة/إزالة منتج من قائمة المقارنة (مع منع اختيار منتجات من فئات مختلفة)
  const toggleCompare = (productId) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;
    let productCategoryId = product.category;
    if (typeof productCategoryId === "object" && productCategoryId !== null) {
      productCategoryId = productCategoryId.id;
    }
    // إذا لم يتم اختيار أي منتج بعد، أضف مباشرة
    if (selectedIds.length === 0) {
      setSelectedIds([productId]);
      setCompareError(null);
      return;
    }
    // تحقق من أن جميع المنتجات المختارة من نفس الفئة
    const selectedProducts = allProducts.filter((p) => selectedIds.includes(p.id));
    const selectedCategoryIds = selectedProducts.map((p) => {
      let catId = p.category;
      if (typeof catId === "object" && catId !== null) return catId.id;
      return catId;
    });
    const allSameCategory = selectedCategoryIds.every((catId) => catId === productCategoryId);
    if (!allSameCategory) {
      setCompareError("يجب اختيار منتجات من نفس الفئة فقط للمقارنة.");
      return;
    }
    setCompareError(null);
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // تنفيذ المقارنة عند الضغط على زر "قارن الآن"
  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setCompareLoading(true);
    setCompareError(null);
    setComparison(null);
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const data = await compareProductsAPI(selectedIds, token);
      setComparison(data);
    } catch (err) {
      setCompareError("فشل في جلب بيانات المقارنة.");
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">مقارنة المنتجات</h1>

        {/* جدول المقارنة */}
        <div className="mb-8">
          {comparison && Array.isArray(comparison.products) && comparison.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full mt-6 border rounded-lg text-center shadow-sm bg-white">
                <thead>
                  <tr className="bg-[#e6f7f7] text-[#005580]">
                    <th className="py-3 px-2 border-b">الاسم</th>
                    <th className="py-3 px-2 border-b">البراند</th>
                    <th className="py-3 px-2 border-b">السعر</th>
                    <th className="py-3 px-2 border-b">التقييم</th>
                    <th className="py-3 px-2 border-b">عدد المشاهدات</th>
                    <th className="py-3 px-2 border-b">الأفضلية</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.products.map((prod) => {
                    let brand = prod.brand_name || prod.brand || (prod.brand_obj && prod.brand_obj.name) || "غير محدد";
                    return (
                      <tr
                        key={prod.id}
                        className={
                          prod.is_best
                            ? "bg-gradient-to-l from-green-100 to-green-50 font-bold text-[#005580] border-2 border-[#1dbf73] shadow-md animate-pulse"
                            : "hover:bg-gray-50"
                        }
                      >
                        <td className="py-2 px-2 border-b">{prod.name}</td>
                        <td className="py-2 px-2 border-b">{brand}</td>
                        <td className="py-2 px-2 border-b">{prod.price}</td>
                        <td className="py-2 px-2 border-b">{prod.rating}</td>
                        <td className="py-2 px-2 border-b">{prod.views}</td>
                        <td className="py-2 px-2 border-b">
                          {prod.is_best && (
                            <span className="inline-block px-3 py-1 rounded-full bg-[#1dbf73] text-white font-bold shadow">الأفضل ⭐</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {comparison.note && (
                <div className="mt-2 text-sm text-[#005580] text-center font-semibold">{comparison.note}</div>
              )}
            </div>
          ) : comparison && comparison.products && Array.isArray(comparison.products) && comparison.products.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-lg text-gray-500">
              لا توجد بيانات مقارنة متاحة.
            </div>
          ) : null}
        </div>

        {/* البحث والتصنيف */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن منتج للمقارنة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div className="md:w-64">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580] appearance-none"
                >
                  <option value="">كل التصنيفات</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* اختيار المنتجات للمقارنة */}
        <div className="mb-4 flex flex-wrap gap-2">
          {compareError && (
            <div className="w-full text-center text-red-600 font-bold mb-2 animate-pulse">
              {compareError}
            </div>
          )}
          {filteredProducts.map((product) => (
            <label key={product.id} className={`flex items-center gap-2 bg-white px-3 py-2 rounded shadow-sm border cursor-pointer ${selectedIds.includes(product.id) ? 'ring-2 ring-[#005580]' : ''}`}>
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={() => toggleCompare(product.id)}
              />
              <span>{product.name}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2 || compareLoading}
          className="mb-6 px-6 py-2 bg-[#005580] text-white rounded hover:bg-[#003d5c] transition-colors font-bold"
        >
          قارن الآن
        </button>

        {/* شبكة المنتجات */}
        {compareLoading && (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-blue-200 border-t-[#005580] rounded-full"></div>
            <h2 className="text-2xl font-bold mb-4">جاري تحميل المقارنة...</h2>
          </div>
        )}
        {compareError && (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold mb-4">حدث خطأ أثناء جلب المقارنة</h2>
            <p className="mb-6 text-red-600">{compareError}</p>
          </div>
        )}
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg">لا يوجد منتجات مطابقة للبحث.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparePage
