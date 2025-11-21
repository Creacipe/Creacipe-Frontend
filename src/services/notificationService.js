// notificationService.js - Service untuk notifikasi user
import api from "./api";

export const notificationService = {
  // Get all notifications
  getMyNotifications: async (params = {}) => {
    return await api.get("/me/notifications", { params });
  },

  // Get unread count
  getUnreadCount: async () => {
    // return await api.get("/me/notifications/unread-count")
    try {
      const response = await api.get("/me/notifications/unread-count");

      // Backend mengembalikan {unread_count: number}
      if (
        response &&
        response.data &&
        typeof response.data.unread_count === "number"
      ) {
        return response.data.unread_count;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  // Mark one as read
  markAsRead: async (notificationId) => {
    return await api.patch(`/me/notifications/${notificationId}/read`);
  },

  // Mark all as read
  markAllAsRead: async () => {
    return await api.patch("/me/notifications/mark-all-read");
  },
};

export default notificationService;
