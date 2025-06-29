import axios from 'axios';

// إنشاء instance خاص من axios
const http = axios.create();

// Interceptor لإضافة Authorization header تلقائياً إذا توفر التوكن
http.interceptors.request.use(
  (config) => {
    // عدّل اسم المفتاح حسب تخزينك للتوكن
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default http;
