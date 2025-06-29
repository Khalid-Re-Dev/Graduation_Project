import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOwnerProduct, createOwnerProduct, updateOwnerProduct } from "../../services/owner.service";
import ProductForm from "../../components/ProductForm";
import { toast } from "react-toastify";
import { getToken } from "../../services/auth.service";

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
    // تحقق من وجود توكن (تسجيل الدخول)
    const token = getToken();
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً لإضافة منتج.");
      navigate("/login");
      return;
    }

    // جلب shop_id الخاص بالمالك باحترافية
    async function fetchShopId() {
      try {
        let res = await import("../../services/owner.service").then(m => m.checkShop());
        // تحقق صريح من وجود متجر
        if (res && typeof res === "object" && res.has_shop === true && res.shop && res.shop.id) {
          setForm(prev => ({ ...prev, shop_id: res.shop.id }));
          return;
        }
        // إذا كان الرد يتطلب إنشاء ملف تعريف مالك
        if (res && res.owner_profile_required) {
          toast.info("يتم الآن إنشاء ملف تعريف المالك...");
          const ownerProfile = await import("../../services/owner.service").then(m => m.createOwnerProfile && m.createOwnerProfile());
          if (ownerProfile && ownerProfile.id) {
            toast.success("تم إنشاء ملف تعريف المالك بنجاح. يرجى إعادة المحاولة.");
            navigate("/owner-dashboard");
            return;
          } else {
            toast.error("تعذر إنشاء ملف تعريف المالك. يرجى التواصل مع الدعم.");
            navigate("/owner-dashboard");
            return;
          }
        }
        // إذا كان الرد يشير إلى عدم وجود متجر
        if (res === null || (res && res.has_shop === false)) {
          setForm(prev => ({ ...prev, shop_id: "" }));
          return;
        }
        // إذا كان الرد يحتوي على رسالة خطأ محددة
        if (res && res.error) {
          toast.error(res.error);
          setForm(prev => ({ ...prev, shop_id: "" }));
          return;
        }
        // fallback: إذا لم يتم التعرف على المتجر بشكل واضح
        setForm(prev => ({ ...prev, shop_id: "" }));
      } catch (err) {
        // إذا كان الخطأ 404 فهذا يعني أنه لا يوجد متجر بعد
        if (err && err.message && err.message.includes('404')) {
          setForm(prev => ({ ...prev, shop_id: "" }));
          return;
        }
        toast.error("حدث خطأ أثناء التحقق من المتجر أو ملف تعريف المالك.");
        navigate("/owner-dashboard");
      }
    }
    fetchShopId();

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
            shop_id: prod.shop_id || ""
          });
        } catch {
          toast.error("فشل في جلب بيانات المنتج");
        }
      })();
    }
  }, [productId, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "اسم المنتج مطلوب";
    if (!form.price) errs.price = "السعر مطلوب";
    if (!form.category_id) errs.category_id = "التصنيف مطلوب";
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
    // تحقق من وجود shop_id قبل الإرسال
    if (!form.shop_id) {
      toast.error("يجب إنشاء متجر أولاً قبل إضافة منتج.");
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key !== "in_stock" && value !== undefined && value !== null) payload.append(key, value);
        });
        payload.append("image", imageFile);
      } else {
        payload = { ...form };
        delete payload.in_stock;
      }
      // تتبع بيانات المنتج قبل الإرسال
      console.log("بيانات المنتج قبل الإرسال:", payload);
      if (productId) {
        const res = await updateOwnerProduct(productId, payload);
        console.log("استجابة تحديث المنتج:", res);
        toast.success("تم تحديث المنتج بنجاح!");
      } else {
        const res = await createOwnerProduct(payload);
        console.log("استجابة إنشاء المنتج:", res);
        toast.success("تم إضافة المنتج بنجاح!");
      }
      navigate("/owner-dashboard");
    } catch (err) {
      console.error("خطأ أثناء حفظ المنتج:", err);
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
