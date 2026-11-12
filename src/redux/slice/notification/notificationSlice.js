// src/redux/slice/notification/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getNotificationsApi } from "../../../services/candidateProfileService";

// ============================================================================
// API 2: NOTIFICATIONS (GET)
// ============================================================================
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getNotificationsApi();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Error fetching notifications"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification(state, action) {
      const notification = {
        id: Date.now().toString(),
        title: action.payload.title,
        desc: action.payload.desc || action.payload.message || "",
        type: action.payload.type || "info",
        time: new Date().toLocaleString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          day: "2-digit",
          month: "short",
        }),
        read: false,
      };
      state.items.unshift(notification);
      state.unreadCount = state.items.filter((n) => !n.read).length;
    },
    markAllRead(state) {
      state.items = state.items.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const rawList = Array.isArray(action.payload?.data)
          ? action.payload.data
          : Array.isArray(action.payload)
          ? action.payload
          : [];

        const apiNotifications = rawList.map((n) => ({
          id: n.id || n._id || String(Math.random()),
          title: n.title || "Notification",
          desc: n.message || n.desc || "",
          read: Boolean(n.isRead),
          type: "info",
          time: n.createdAt
            ? new Date(n.createdAt).toLocaleDateString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                day: "2-digit",
                month: "short",
              })
            : "",
        }));

        state.items = apiNotifications;
        state.unreadCount = apiNotifications.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addNotification, markAllRead, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
