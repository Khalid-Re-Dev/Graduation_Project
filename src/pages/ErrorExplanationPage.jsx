import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";

function ErrorExplanationPage() {
  // جلب تفاصيل الخطأ من state القادم من ErrorBoundary
  const location = useLocation();
  const error = location.state?.error;
  const errorInfo = location.state?.errorInfo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center border border-red-200">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-red-700 mb-2">حدث خطأ في الموقع</h1>
        <p className="text-gray-700 mb-4">
          عذراً، حدثت مشكلة أثناء تحميل البيانات أو عرض الصفحة. غالباً ما يكون السبب أحد الأمور التالية:
        </p>
        <ul className="text-right text-gray-600 mb-4 list-disc pr-6">
          <li>البيانات من الخادم غير مكتملة أو غير متوقعة (مثلاً: عنصر غير موجود أو مصفوفة غير معرفة).</li>
          <li>انقطاع الاتصال بالإنترنت أو مشكلة في الشبكة.</li>
          <li>مشكلة مؤقتة في الخادم أو تحديثات على الموقع.</li>
        </ul>
        {error && (
          <div className="bg-red-50 text-red-800 rounded p-2 mb-4 text-xs break-all">
            <b>تفاصيل الخطأ:</b> {error.toString()}
          </div>
        )}
        {errorInfo?.componentStack && (
          <div className="bg-gray-50 text-gray-700 rounded p-2 mb-4 text-xs break-all text-left max-h-32 overflow-auto">
            <b>Stack Trace:</b>
            <pre>{errorInfo.componentStack}</pre>
          </div>
        )}
        <Link to="/" className="inline-block mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition">
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}

export default ErrorExplanationPage;
