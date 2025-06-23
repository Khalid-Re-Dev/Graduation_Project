import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategories } from "../../services/product.service";
import { getOwnerProduct, updateOwnerProduct } from "../../services/owner.service";
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

export default function EditProduct() {
  const { id } = useParams();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getOwnerProduct(id);
        setForm({
          ...initialState,
          ...data,
          category_id: data.category?.id || data.category_id || "",
          brand_id: data.brand?.id || data.brand_id || "",
        });
      } catch (err) {
        toast.error("فشل في جلب بيانات المنتج");
      }
    }
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await updateOwnerProduct(id, form);
      toast.success("تم تحديث المنتج بنجاح");
      navigate("/owner-dashboard");
    } catch (err) {
      setErrors(err?.response?.data || {});
      toast.error("فشل في تحديث المنتج");
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
      mode="edit"
    />
  );
}
