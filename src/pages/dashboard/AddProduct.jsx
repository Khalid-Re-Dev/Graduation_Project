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
  stock: "",
  shop_id: ""
};

export default function AddProduct() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      // طباعة البيانات قبل الإرسال
      console.log("Form data being sent:", form);
      // جرب إرسال brand بدل brand_id إذا كان brand_id موجود
      const dataToSend = { ...form };
      if (form.brand_id) {
        dataToSend.brand = form.brand_id;
      }
      // أزل brand_id إذا أضفت brand
      delete dataToSend.brand_id;
      if (!form.brand_id) {
        setErrors({ brand_id: "الرجاء اختيار الماركة" });
        setLoading(false);
        return;
      }
      await createOwnerProduct(dataToSend);
      toast.success("تم إضافة المنتج بنجاح");
      navigate("/dashboard/products");
    } catch (err) {
      setErrors(err?.response?.data || {});
      toast.error("فشل في إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductForm
      form={form}
      setForm={setForm}
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
      mode="add"
    />
  );
}
