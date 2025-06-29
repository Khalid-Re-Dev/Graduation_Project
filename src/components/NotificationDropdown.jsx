import { useEffect, useState } from "react";
import { notificationService } from "../services/notification.service";
import { toast } from "react-toastify";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    notificationService.getNotifications({ limit: 10 })
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => {
        setError("فشل في جلب الإشعارات");
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50">
      <div className="p-3 border-b font-bold text-gray-700">الإشعارات</div>
      {loading && <div className="p-4 text-center text-gray-500">جاري التحميل...</div>}
      {error && <div className="p-4 text-center text-red-500">{error}</div>}
      {!loading && !error && notifications.length === 0 && (
        <div className="p-4 text-center text-gray-400">لا توجد إشعارات جديدة</div>
      )}
      <ul>
        {notifications.map((n) => (
          <li key={n.id} className="px-4 py-2 border-b last:border-b-0 text-sm text-gray-700">
            {n.message || n.title || "إشعار جديد"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationDropdown;
