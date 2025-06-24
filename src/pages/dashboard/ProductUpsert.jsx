import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOwnerProduct, createOwnerProduct, updateOwnerProduct } from "../../services/owner.service";
import ProductForm from "../../components/ProductForm";
import { toast } from "react-toastify";

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

export default function ProductUpsert() {
  const { productId } = useParams();
  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      (async () => {
        try {
          const prod = await getOwnerProduct(productId);
          setForm({
            ...initialState,
            ...prod,
            category_id: prod.category?.id ? String(prod.category.id) : prod.category_id ? String(prod.category_id) : "",
            brand_id: prod.brand_id || "",
            image_url: prod.image_url || "",
            video_url: prod.video_url || "",
            release_date: prod.release_date ? prod.release_date.slice(0, 10) : "",
            is_active: prod.is_active,
            in_stock: prod.in_stock,
            stock: prod.stock || "",
            shop_id: prod.shop_id || ""
          });
        } catch {
          toast.error("فشل في جلب بيانات المنتج");
        }
      })();
    }
  }, [productId]);

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "اسم المنتج مطلوب";
    if (!form.price) errs.price = "السعر مطلوب";
    if (!form.category_id) errs.category_id = "التصنيف مطلوب";
    if (!form.stock) errs.stock = "المخزون مطلوب";
    if (!form.original_price) errs.original_price = "السعر الأصلي مطلوب";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (value !== undefined && value !== null) payload.append(key, value);
        });
        payload.append("image", imageFile);
      } else {
        payload = { ...form };
      }
      if (productId) {
        await updateOwnerProduct(productId, payload);
        toast.success("تم تحديث المنتج بنجاح!");
      } else {
        await createOwnerProduct(payload);
        toast.success("تم إضافة المنتج بنجاح!");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error("فشل في حفظ المنتج. تحقق من البيانات.");
      if (err?.response?.data) setErrors(err.response.data);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">{productId ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
      <ProductForm
        initialData={initialState}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
        setImageFile={setImageFile}
        form={form}
        setForm={setForm}
        mode={productId ? "edit" : "add"}
      />
    </div>
  );
}
