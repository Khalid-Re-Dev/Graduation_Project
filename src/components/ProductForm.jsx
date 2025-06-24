import React, { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../components/ui/select";
import { getCategoriesDirect } from "../services/product.service";
import { getOwnerBrands } from "../services/owner.service";
import { toast } from "react-toastify";

export default function ProductForm({ initialData, onSubmit, loading, errors, setImageFile, form, setForm, mode }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategoriesDirect();
        let categoryList = Array.isArray(cats) ? cats : cats.results || [];
        categoryList = categoryList.map(cat => ({ ...cat, id: String(cat.id) }));
        setCategories(categoryList);
        if (categoryList.length === 0) {
          toast.warn("لم يتم العثور على تصنيفات. يرجى إضافة تصنيفات أولاً.");
        }
      } catch {
        toast.error("فشل في جلب التصنيفات. يرجى المحاولة لاحقاً.");
      }
    }
    fetchCategories();
    async function fetchBrands() {
      try {
        const brandsData = await getOwnerBrands();
        let brandList = Array.isArray(brandsData) ? brandsData : brandsData.results || [];
        brandList = brandList.map(brand => ({ ...brand, id: String(brand.id) }));
        setBrands(brandList);
        if (brandList.length === 0) {
          toast.warn("لم يتم العثور على ماركات. يرجى إضافة ماركات أولاً.");
        }
      } catch {
        toast.error("فشل في جلب الماركات. يرجى المحاولة لاحقاً.");
      }
    }
    fetchBrands();
  }, []);

  // إشعار عند نجاح أو فشل الحفظ/التعديل
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      toast.error("فشل في حفظ المنتج. تحقق من البيانات.");
    }
    // يمكن إضافة إشعار نجاح هنا إذا كان هناك متغير يدل على النجاح (مثلاً success أو redirect)
    // لكن حالياً يتم ذلك في الصفحة الأم (AddProduct, EditProduct) بعد نجاح الطلب
  }, [errors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">اسم المنتج *</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
      </div>
      <div>
        <label className="block mb-1">الوصف</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">السعر *</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
        </div>
        <div>
          <label className="block mb-1">السعر الأصلي *</label>
          <input name="original_price" type="number" value={form.original_price} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.original_price && <div className="text-red-500 text-xs mt-1">{errors.original_price}</div>}
        </div>
      </div>
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">التصنيف *</label>
        <Select value={form.category_id} onValueChange={val => setForm({ ...form, category_id: val })}>
          <SelectTrigger className="w-full border rounded px-3 py-2">
            <SelectValue placeholder="اختر تصنيفًا" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
      </div>
      <div>
        <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">الماركة *</label>
        <Select value={form.brand_id} onValueChange={val => setForm({ ...form, brand_id: val })}>
          <SelectTrigger className="w-full border rounded px-3 py-2">
            <SelectValue placeholder="اختر ماركة" />
          </SelectTrigger>
          <SelectContent>
            {brands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.brand_id && <p className="text-red-500 text-xs mt-1">{errors.brand_id}</p>}
      </div>
      <div>
        <label className="block mb-1">رابط الصورة (أو ارفع صورة)</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full border rounded px-3 py-2 mb-2" />
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
      </div>
      <div>
        <label className="block mb-1">رابط الفيديو</label>
        <input name="video_url" value={form.video_url} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">تاريخ الإصدار</label>
          <input name="release_date" type="date" value={form.release_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">المخزون *</label>
          <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.stock && <div className="text-red-500 text-xs mt-1">{errors.stock}</div>}
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> نشط
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="in_stock" checked={form.in_stock} onChange={handleChange} /> متوفر
        </label>
      </div>
      <button type="submit" className="w-full bg-[#005580] text-white py-2 rounded hover:bg-[#004466]" disabled={loading}>
        {loading ? (mode === "edit" ? "جاري التحديث..." : "جاري الحفظ...") : (mode === "edit" ? "تحديث المنتج" : "حفظ المنتج")}
      </button>
    </form>
  );
}
