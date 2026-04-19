import axios from 'axios';

const API_URL = 'http://localhost:8080/api/user/notifications';

const notificationService = {
  /**
   * Get all notifications for the user
   */
  getNotifications: async (token) => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications only
   */
  getUnreadNotifications: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId, token) => {
    try {
      const response = await axios.put(
        `${API_URL}/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (token) => {
    try {
      const response = await axios.put(
        `${API_URL}/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId, token) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Get user notification preferences
   */
  getPreferences: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },

  /**
   * Update user notification preferences
   */
  updatePreferences: async (preferences, token) => {
    try {
      const response = await axios.put(
        `${API_URL}/preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
};

export default notificationService;
