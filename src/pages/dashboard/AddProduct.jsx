import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../services/product.service";
import { createOwnerProduct } from "../../services/owner.service";
import { toast } from "react-toastify";
import ProductForm from "../../components/ProductForm";

const initialState = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category_id: "",
  brand_id: "",
  image_url: "",
  video_url: "",
  release_date: "",
  is_active: true,
  in_stock: true,
  brand_id: "",
  shop_id: ""
};

export default function AddProduct({ onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      console.log("Creating product with data:", formData);
      
      // إرسال البيانات كما هي (FormData) إلى خدمة الإنشاء
      await createOwnerProduct(formData);
      toast.success("تم إضافة المنتج بنجاح");
      navigate("/owner-dashboard");
    } catch (err) {
      console.error("Error creating product:", err);
      
      // معالجة أخطاء الخادم
      if (err?.response?.data) {
        setErrors(err.response.data);
        // عرض رسائل الخطأ المحددة
        const errorMessages = Object.values(err.response.data).flat();
        if (errorMessages.length > 0) {
          toast.error(errorMessages[0]);
        }
      } else if (err?.error) {
        toast.error(err.error);
      } else {
        toast.error("فشل في إضافة المنتج");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">إضافة منتج جديد</h1>
        <ProductForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          loading={loading}
          errors={errors}
          imageFile={imageFile}
          setImageFile={setImageFile}
          mode="add"
        />
      </div>
    </div>
  );
}
