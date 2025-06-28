import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import { getCategories } from "../services/product.service";
import { getOwnerBrands } from "../services/owner.service";
import { toast } from "react-toastify";

export default function ProductForm({
  initialData,
  onSubmit,
  loading,
  errors,
  imageFile,
  setImageFile,
  form,
  setForm,
  mode,
}) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        let categoryList = Array.isArray(cats) ? cats : cats.results || [];
        categoryList = categoryList.map((cat) => ({ ...cat, id: String(cat.id) }));
        setCategories(categoryList);
        if (categoryList.length === 0) {
          toast.warn("No categories found. Please add categories first.");
        }
      } catch {
        toast.error("Failed to fetch categories. Please try again later.");
      }
    }

    async function fetchBrands() {
      try {
        const brandsData = await getOwnerBrands();
        let brandList = Array.isArray(brandsData) ? brandsData : brandsData.results || [];
        brandList = brandList.map((brand) => ({ ...brand, id: String(brand.id) }));
        setBrands(brandList);
        if (brandList.length === 0) {
          toast.warn("No brands found. Please add brands first.");
        }
      } catch {
        toast.error("Failed to fetch brands. Please try again later.");
      }
    }

    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      toast.error("Failed to save product. Please check the form.");
    }
  }, [errors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // تحقق من وجود تصنيفات وبراندات
    if (categories.length === 0) {
      toast.error("يجب إضافة تصنيفات أولاً قبل إنشاء منتج.");
      return;
    }
    if (brands.length === 0) {
      toast.error("يجب إضافة براندات أولاً قبل إنشاء منتج.");
      return;
    }

    // التحقق من البيانات المطلوبة
    const requiredFields = ['name', 'price', 'original_price', 'category_id', 'brand_id', 'stock'];
    const missingFields = requiredFields.filter(field => !form[field] || form[field] === '');
    if (missingFields.length > 0) {
      missingFields.forEach(field => {
        toast.error(`الحقل مطلوب: ${field}`);
      });
      return;
    }

    // منع إرسال صورة وimage_url معًا
    if (imageFile && form.image_url) {
      toast.error("يرجى اختيار صورة أو إدخال رابط صورة فقط، وليس كلاهما.");
      return;
    }

    // إنشاء FormData لإرسال البيانات مع الصور
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }
    onSubmit(e, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
      <div>
        <label className="block mb-1 font-medium">Product Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Price *</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Original Price *</label>
          <input
            name="original_price"
            type="number"
            value={form.original_price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.original_price && (
            <p className="text-red-500 text-xs mt-1">{errors.original_price}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="category_id" className="block mb-1 font-medium">Category *</label>
        <Select value={form.category_id} onValueChange={val => setForm({ ...form, category_id: val })}>
          <SelectTrigger className="w-full border rounded px-3 py-2">
 <SelectValue placeholder="" className="bg-white" />
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
        <label htmlFor="brand_id" className="block mb-1 font-medium">Brand *</label>
        <Select value={form.brand_id} onValueChange={val => setForm({ ...form, brand_id: val })}>
          <SelectTrigger className="w-full border rounded px-3 py-2">
 <SelectValue placeholder="" className="bg-white" />
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
        <label className="block mb-1 font-medium">Image URL (or upload an image)</label>
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Video URL</label>
        <input
          name="video_url"
          value={form.video_url}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Release Date</label>
          <input
            name="release_date"
            type="date"
            value={form.release_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {/* Removed stock field */}
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Active
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="in_stock"
            checked={form.in_stock}
            onChange={handleChange}
          />
          In Stock
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        disabled={loading}
      >
        {loading
          ? mode === "edit"
            ? "Updating..."
            : "Saving..."
          : mode === "edit"
          ? "Update Product"
          : "Save Product"}
      </button>
    </form>
  );
}
