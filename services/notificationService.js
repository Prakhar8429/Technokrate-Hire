import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from '../src/storage/authStorage';

class NotificationService {
  constructor() {
    this._cachedUnreadCount = 0;
  }

  async _resolveToken() {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }

  // 1. Get paginated notifications (PDF Item 11)
  // GET /api/jobseeker/notifications?page=1&limit=10&unread=false
  async getNotifications({ page = 1, limit = 10, unread = false } = {}) {
    const token = await this._resolveToken();
    if (!token) {
      return {
        notifications: [],
        pagination: { total: 0, page, limit, totalPages: 1 },
      };
    }

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        unread: String(unread),
      });

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS}?${query.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const json = await response.json();
        const data = json.data || json;
        const list = Array.isArray(data.notifications) ? data.notifications : (Array.isArray(data) ? data : []);
        return {
          success: true,
          notifications: list,
          pagination: data.pagination || {
            total: list.length,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(list.length / limit)),
          },
        };
      }
    } catch (e) {
      console.log('getNotifications network error:', e.message);
    }

    return {
      success: false,
      notifications: [],
      pagination: { total: 0, page, limit, totalPages: 1 },
    };
  }

  // 2. Get unread notification count (PDF Item 12)
  // GET /api/jobseeker/notifications/unread-count
  async getUnreadCount() {
    const token = await this._resolveToken();
    if (!token) return 0;

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const json = await response.json();
        const count = json.data?.unreadCount ?? json.unreadCount ?? 0;
        this._cachedUnreadCount = count;
        return count;
      }
    } catch (e) {
      console.log('getUnreadCount network error:', e.message);
    }

    return this._cachedUnreadCount;
  }

  // 3. Mark all notifications as read (PDF Item 13)
  // PATCH /api/jobseeker/notifications/read-all
  async markAllAsRead() {
    const token = await this._resolveToken();
    if (!token) return { success: false };

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_READ_ALL}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const json = await response.json();
        this._cachedUnreadCount = 0;
        return { success: true, data: json.data };
      }
    } catch (e) {
      console.log('markAllAsRead network error:', e.message);
    }

    return { success: false };
  }

  // 4. Mark single notification as read (PDF Item 14)
  // PATCH /api/jobseeker/notifications/:id/read
  async markSingleAsRead(notificationId) {
    if (!notificationId) return { success: false };
    const token = await this._resolveToken();
    if (!token) return { success: false };

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_READ_ITEM(notificationId)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const json = await response.json();
        if (this._cachedUnreadCount > 0) this._cachedUnreadCount -= 1;
        return { success: true, data: json.data };
      }
    } catch (e) {
      console.log('markSingleAsRead network error:', e.message);
    }

    return { success: false };
  }

  // 5. Register push notification token (PDF Item 15)
  // POST /api/jobseeker/push-tokens
  async registerPushToken({ token, platform = 'android', deviceId = '' } = {}) {
    if (!token) return { success: false };
    const authToken = await this._resolveToken();
    if (!authToken) return { success: false };

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PUSH_TOKENS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token, platform, deviceId }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        return { success: true, data: json.data };
      }
    } catch (e) {
      console.log('registerPushToken network error:', e.message);
    }

    return { success: false };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
