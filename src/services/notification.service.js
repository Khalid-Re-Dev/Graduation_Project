import { apiService } from "./api.service";

// Notification service for handling notification-related API requests
export const notificationService = {
  // Get notifications
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/notifications/?${query}` : "/notifications/";
    return await apiService.get(url);
  },

  // Mark all as read
  markAllRead: async () => {
    return await apiService.put("/notifications/mark-all-read/");
  },

  // Delete all notifications
  deleteAll: async () => {
    return await apiService.delete("/notifications/");
  },

  // Delete single notification
  deleteNotification: async (id) => {
    return await apiService.delete(`/notifications/${id}/`);
  },

  // Generate AI notifications
  generateAI: async () => {
    return await apiService.post("/notifications/generate-ai/");
  },
};
