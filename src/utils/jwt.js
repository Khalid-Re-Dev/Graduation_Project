// دالة لفك تشفير التوكن (JWT) بدون مكتبة خارجية
export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// دالة لإرجاع كل بيانات المستخدم من التوكن (payload)
export function getCurrentUserPayload() {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return parseJwt(token);
}

// دالة لإرجاع نوع المستخدم الحالي من التوكن (user_type)
export function getCurrentUserRole() {
  const payload = getCurrentUserPayload();
  // عدّل حسب اسم الحقل في الباكند (user_type أو role أو is_staff ...)
  return payload?.user_type || payload?.role || payload?.is_staff || null;
}

// دالة لإرجاع معرف المستخدم الحالي من التوكن (user_id)
export function getCurrentUserId() {
  const payload = getCurrentUserPayload();
  // عدّل حسب اسم الحقل في الباكند (user_id أو id أو sub ...)
  return payload?.user_id || payload?.id || payload?.sub || null;
}
