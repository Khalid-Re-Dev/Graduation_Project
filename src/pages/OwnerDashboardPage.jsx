"use client"

//jl
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  BarChart, PieChart, Settings, Package, ShoppingBag,
  TrendingUp, Plus, Edit, Trash2, Search, AlertCircle,
  Loader2, Store, Tag, FileText
} from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../components/ui/select"

// Import owner services
import {
  checkShop, registerShop, getOwnerStats, getOwnerProducts,
  getOwnerAnalytics, getShopSettings, updateShopSettings,
  createOwnerProduct, updateOwnerProduct, deleteOwnerProduct,
  getOwnerBrands, createOwnerBrand
} from "../services/owner.service"
import { getCategories } from "../services/product.service"

// OwnerDashboardPage component
function OwnerDashboardPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // State for shop data
  const [hasShop, setHasShop] = useState(false)
  const [shop, setShop] = useState(null)
  const [shopFormData, setShopFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    logo: null,
    url: '' // إضافة حقل رابط المتجر
  })
  const [shopFormErrors, setShopFormErrors] = useState({})

  // State for dashboard data
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [errorAnalytics, setErrorAnalytics] = useState("")
  const [orders, setOrders] = useState([])
  const [settings, setSettings] = useState(null)

  // UI state
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState({ page: true, form: false })
  const [error, setError] = useState({ page: '', form: '', shop: '' })

  // --- إدارة المنتجات ---
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [productModalLoading, setProductModalLoading] = useState(false)
  const [productModalErrors, setProductModalErrors] = useState({})
  const [productModalInitial, setProductModalInitial] = useState(null)
  const [categories, setCategories] = useState([])

  // فحص وجود متجر للمالك عند الدخول
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    if (user?.user_type !== "owner") {
      setError({ ...error, page: "غير مصرح لك بالوصول إلى لوحة تحكم المالك." })
      setLoading({ ...loading, page: false })
      return
    }
    const checkOwnerShop = async () => {
      setLoading({ ...loading, page: true })
      setError({ ...error, page: '' })
      try {
        const res = await checkShop()
        if (res.has_shop) {
          setHasShop(true)
          setShop(res.shop)
          // جلب بيانات الداشبورد
          await loadDashboardData()
        } else {
          setHasShop(false)
        }
      } catch (err) {
        setHasShop(false)
        if (err?.response?.data?.error) {
          setError({ ...error, shop: err.response.data.error })
        }
      }
      setLoading({ ...loading, page: false })
    }
    checkOwnerShop()
    // eslint-disable-next-line
  }, [isAuthenticated, user, navigate])

  // دالة لجلب بيانات الداشبورد بعد التأكد من وجود متجر
  const loadDashboardData = async () => {
    setLoading((prev) => ({ ...prev, page: true }))
    setError((prev) => ({ ...prev, page: '' }))
    setErrorAnalytics("")
    try {
      const [statsRes, productsRes, analyticsRes, settingsRes] = await Promise.all([
        getOwnerStats(),
        getOwnerProducts(),
        // analytics
        (async () => {
          try {
            return await getOwnerAnalytics()
          } catch (err) {
            setErrorAnalytics("تعذر تحميل بيانات الإحصائيات. هناك مشكلة في السيرفر.")
            return null
          }
        })(),
        getShopSettings()
      ])
      setStats(statsRes)
      setProducts(productsRes)
      setAnalytics(analyticsRes)
      setSettings(settingsRes)
    } catch (err) {
      setError((prev) => ({ ...prev, page: "حدث خطأ أثناء جلب بيانات المتجر. حاول لاحقًا." }))
    }
    setLoading((prev) => ({ ...prev, page: false }))
  }

  // معالجة تغيير حقول نموذج المتجر
  const handleShopFormChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === "file") {
      setShopFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setShopFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // معالجة إرسال نموذج إنشاء المتجر
  const handleRegisterShop = async (e) => {
    e.preventDefault()
    setLoading((prev) => ({ ...prev, form: true }))
    setError((prev) => ({ ...prev, form: '' }))
    setShopFormErrors({})
    try {
      const formDataObj = new FormData()
      Object.entries(shopFormData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          formDataObj.append(key, value)
        }
      })
      const response = await registerShop(formDataObj)
      setHasShop(true)
      setShop(response.shop)
      await loadDashboardData()
    } catch (err) {
      // معالجة الأخطاء القادمة من الباك إند
      if (err?.response?.data) {
        const apiErrors = err.response.data
        setShopFormErrors(apiErrors)
        setError((prev) => ({ ...prev, form: apiErrors.error || "فشل في إنشاء المتجر" }))
      } else {
        setError((prev) => ({ ...prev, form: "فشل في إنشاء المتجر" }))
      }
    } finally {
      setLoading((prev) => ({ ...prev, form: false }))
    }
  }

  // جلب التصنيفات عند فتح المودال (دائمًا من الباك إند)
  const openProductModal = async (initial = null) => {
    setProductModalErrors({})
    setProductModalInitial(initial)
    setProductModalOpen(true)
    setCategories([]) // إظهار قائمة فارغة مؤقتًا أثناء التحميل
    try {
      // جلب التصنيفات من الباك إند
      const cats = await getCategories()
      // دعم تنسيقات الاستجابة المختلفة (مصفوفة أو كائن فيه results)
      setCategories(Array.isArray(cats) ? cats : cats.results || [])
    } catch {
      setCategories([])
    }
  }

  // إضافة منتج جديد
  const handleAddProduct = () => navigate("/dashboard/add-product")
  // تعديل منتج
  const handleEditProduct = (prod) => navigate(`/dashboard/edit-product/${prod.id}`)
  // حذف منتج
  const handleDeleteProduct = async (prod) => {
    if (!window.confirm('هل أنت متأكد من حذف المنتج؟')) return
    setLoading((prev) => ({ ...prev, page: true }))
    try {
      await deleteOwnerProduct(prod.id)
      await loadDashboardData()
    } catch {
      setError((prev) => ({ ...prev, page: 'فشل في حذف المنتج' }))
    }
    setLoading((prev) => ({ ...prev, page: false }))
  }

  // --- إصلاح حفظ إعدادات المتجر ---
  // تحديث إعدادات المتجر مع إرسال جميع الحقول المطلوبة
  const handleSaveSettings = async (data) => {
    setLoading((prev) => ({ ...prev, form: true }))
    setError((prev) => ({ ...prev, form: '' }))
    try {
      // تأكد من إرسال جميع الحقول حتى الفارغة (قد يتطلب الباك إند ذلك)
      const payload = {
        name: data.name || '',
        url: data.url || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || ''
      }
      await updateShopSettings(payload)
      await loadDashboardData()
      setError((prev) => ({ ...prev, form: '' }))
    } catch (err) {
      if (err?.response?.data) {
        setError((prev) => ({ ...prev, form: err.response.data.error || 'فشل في تحديث بيانات المتجر' }))
      } else {
        setError((prev) => ({ ...prev, form: 'فشل في تحديث بيانات المتجر' }))
      }
    } finally {
      setLoading((prev) => ({ ...prev, form: false }))
    }
  }

  // عرض واجهة إنشاء المتجر إذا لم يكن لدى المالك متجر
  if (!loading.page && !hasShop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Store className="text-[#005580] mr-2" size={24} />
            <h1 className="text-2xl font-bold">تسجيل متجر جديد</h1>
          </div>
          {error.shop && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>{error.shop}</span>
            </div>
          )}
          {error.form && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>{error.form}</span>
            </div>
          )}
          <form onSubmit={handleRegisterShop}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={shopFormData.name} onChange={handleShopFormChange} className={`w-full px-3 py-2 border ${shopFormErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`} required />
              {shopFormErrors.name && <p className="text-red-500 text-xs mt-1">{shopFormErrors.name}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">رابط المتجر <span className="text-red-500">*</span></label>
              <input type="url" name="url" value={shopFormData.url} onChange={handleShopFormChange} className={`w-full px-3 py-2 border ${shopFormErrors.url ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`} required placeholder="https://yourshop.com" />
              {shopFormErrors.url && <p className="text-red-500 text-xs mt-1">{shopFormErrors.url}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف المتجر</label>
              <textarea name="description" value={shopFormData.description} onChange={handleShopFormChange} className={`w-full px-3 py-2 border ${shopFormErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`} rows="3"></textarea>
              {shopFormErrors.description && <p className="text-red-500 text-xs mt-1">{shopFormErrors.description}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان <span className="text-red-500">*</span></label>
                <input type="text" name="address" value={shopFormData.address} onChange={handleShopFormChange} className={`w-full px-3 py-2 border ${shopFormErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`} required />
                {shopFormErrors.address && <p className="text-red-500 text-xs mt-1">{shopFormErrors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input type="text" name="phone" value={shopFormData.phone} onChange={handleShopFormChange} className={`w-full px-3 py-2 border ${shopFormErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`} />
                {shopFormErrors.phone && <p className="text-red-500 text-xs mt-1">{shopFormErrors.phone}</p>}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input type="email" name="email" value={shopFormData.email} onChange={handleShopFormChange} className={`w-full px-3 py-2 border ${shopFormErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`} />
              {shopFormErrors.email && <p className="text-red-500 text-xs mt-1">{shopFormErrors.email}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">شعار المتجر <span className="text-red-500">*</span></label>
              <input type="file" name="logo" onChange={handleShopFormChange} className={`w-full px-3 py-2 border ${shopFormErrors.logo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#005580]`} accept="image/*" required />
              {shopFormErrors.logo && <p className="text-red-500 text-xs mt-1">{shopFormErrors.logo}</p>}
            </div>
            <button type="submit" className="w-full bg-[#005580] text-white py-2 px-4 rounded-md hover:bg-[#004466] transition-colors" disabled={loading.form}>
              {loading.form ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  جاري التسجيل...
                </span>
              ) : (
                "تسجيل المتجر"
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading.page) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#005580] border-r-[#005580] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (error.page) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          <span>{error.page}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-[#005580]">لوحة تحكم المالك</h1>
        {/* Tabs for navigation */}
        <div className="flex gap-4 border-b mb-8">
          <button className={`py-2 px-4 font-medium ${activeTab === "overview" ? "border-b-2 border-[#005580] text-[#005580]" : "text-gray-500"}`} onClick={() => setActiveTab("overview")}>نظرة عامة</button>
          <button className={`py-2 px-4 font-medium ${activeTab === "products" ? "border-b-2 border-[#005580] text-[#005580]" : "text-gray-500"}`} onClick={() => setActiveTab("products")}>المنتجات</button>
          <button className={`py-2 px-4 font-medium ${activeTab === "settings" ? "border-b-2 border-[#005580] text-[#005580]" : "text-gray-500"}`} onClick={() => setActiveTab("settings")}>إعدادات المتجر</button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && (
            <OverviewTab stats={stats} />
          )}
          {activeTab === "products" && (
            <>
              <ProductsTab
                products={products}
                onAdd={handleAddProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </>
          )}
          {activeTab === "settings" && (
            <SettingsTab settings={settings} onSave={handleSaveSettings} loading={loading.form} error={error.form} />
          )}
        </div>
      </div>
    </div>
  )
}

// مكونات فرعية لكل تبويب
function OverviewTab({ stats }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <Package className="text-[#005580] mb-2" size={32} />
          <div className="text-lg font-bold">{stats?.total_products ?? 0}</div>
          <div className="text-gray-500">عدد المنتجات</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <Tag className="text-[#005580] mb-2" size={32} />
          <div className="text-lg font-bold">{stats?.total_customers ?? 0}</div>
          <div className="text-gray-500">عدد العملاء</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <TrendingUp className="text-[#005580] mb-2" size={32} />
          <div className="text-lg font-bold">{stats?.customers_change ?? 0}</div>
          <div className="text-gray-500">تغير العملاء</div>
        </div>
      </div>
      {/* المنتجات الأكثر شعبية */}
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <div className="font-bold mb-4">المنتجات الأكثر شعبية</div>
        {stats?.top_products?.length ? (
          <ul className="divide-y">
            {stats.top_products.map((prod, idx) => (
              <li key={prod.id || idx} className="py-2 flex items-center justify-between">
                <span>{prod.name}</span>
                <span className="text-gray-500 text-xs">{prod.views ?? 0} مشاهدة</span>
              </li>
            ))}
          </ul>
        ) : <div className="text-gray-400">لا توجد منتجات شعبية بعد.</div>}
      </div>
    </>
  )
}

function ProductsTab({ products, onAdd, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-lg">المنتجات</div>
        <button onClick={onAdd} className="bg-[#005580] text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={18}/> إضافة منتج</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">الاسم</th>
              <th className="py-2 px-4">السعر</th>
              <th className="py-2 px-4">المخزون</th>
              <th className="py-2 px-4">الحالة</th>
              <th className="py-2 px-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products?.length ? products.map((prod) => (
              <tr key={prod.id} className="border-b">
                <td className="py-2 px-4">{prod.name}</td>
                <td className="py-2 px-4">{prod.price ?? '-'}</td>
                <td className="py-2 px-4">{prod.stock ?? '-'}</td>
                <td className="py-2 px-4">{prod.is_active ? 'نشط' : 'غير نشط'}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button onClick={() => onEdit(prod)} className="text-blue-600 hover:underline flex items-center"><Edit size={16}/></button>
                  <button onClick={() => onDelete(prod)} className="text-red-600 hover:underline flex items-center"><Trash2 size={16}/></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center text-gray-400 py-4">لا توجد منتجات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
// تبويب إعدادات المتجر
function SettingsTab({ settings, onSave, loading, error }) {
  const [form, setForm] = useState(settings || { name: '', description: '', address: '', phone: '', email: '', url: '' })
  useEffect(() => { setForm(settings || { name: '', description: '', address: '', phone: '', email: '', url: '' }) }, [settings])
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = e => { e.preventDefault(); onSave(form) }
  return (
    <div className="max-w-xl bg-white rounded-lg shadow p-6">
      <div className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={20}/> إعدادات المتجر</div>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">اسم المتجر <span className="text-red-500">*</span></label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1">رابط المتجر <span className="text-red-500">*</span></label>
          <input name="url" value={form.url} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1">وصف المتجر</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">العنوان <span className="text-red-500">*</span></label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block mb-1">رقم الهاتف</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block mb-1">البريد الإلكتروني</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="w-full bg-[#005580] text-white py-2 rounded hover:bg-[#004466]" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
      </form>
    </div>
  )
}

export default OwnerDashboardPage
