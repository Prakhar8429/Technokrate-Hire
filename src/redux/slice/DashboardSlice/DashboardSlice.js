import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";
import {
  getProfileCompletenessApi,
  getDashboardPlansApi,
} from "../../../services/candidateProfileService";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  return {
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
  };
};

// ============================================================================
// DASHBOARD DATA
// ============================================================================
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        getApiUrl("/api/jobseeker/dashboard"),
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to fetch dashboard data"
      );
    }
  }
);

// ============================================================================
// API 1: PROFILE COMPLETENESS (GET)
// ============================================================================
export const fetchProfileCompleteness = createAsyncThunk(
  "dashboard/fetchProfileCompleteness",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfileCompletenessApi();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Error calculating profile completeness"
      );
    }
  }
);

// ============================================================================
// API 3: DASHBOARD PLANS (GET)
// ============================================================================
export const fetchDashboardPlans = createAsyncThunk(
  "dashboard/fetchDashboardPlans",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDashboardPlansApi();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Error fetching dashboard plans"
      );
    }
  }
);

// ============================================================================
// INITIAL STATE
// ============================================================================
const initialState = {
  user: null,
  stats: { appliedJobsCount: 0, savedJobsCount: 0 },
  recentJobs: { data: [] },
  appliedJobs: { data: [] },
  profileCompleteness: {
    percentage: 0,
    missingSections: [],
    isComplete: false,
    loading: false,
    error: null,
  },
  dashboardPlans: {
    currentPlan: null,
    availablePlans: [],
    loading: false,
    error: null,
  },
  loading: false,
  error: null,
};

// ============================================================================
// SLICE
// ============================================================================
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user;
        state.stats = action.payload?.stats || { appliedJobsCount: 0, savedJobsCount: 0 };
        state.recentJobs = action.payload?.recentJobs || { data: [] };
        state.appliedJobs = action.payload?.appliedJobs || { data: [] };
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // API 1: Profile Completeness
      .addCase(fetchProfileCompleteness.pending, (state) => {
        state.profileCompleteness.loading = true;
        state.profileCompleteness.error = null;
      })
      .addCase(fetchProfileCompleteness.fulfilled, (state, action) => {
        state.profileCompleteness.loading = false;
        if (action.payload) {
          state.profileCompleteness.percentage = action.payload.percentage ?? 0;
          state.profileCompleteness.missingSections = Array.isArray(action.payload.missingSections)
            ? action.payload.missingSections
            : [];
          state.profileCompleteness.isComplete = Boolean(action.payload.isComplete);
        }
      })
      .addCase(fetchProfileCompleteness.rejected, (state, action) => {
        state.profileCompleteness.loading = false;
        state.profileCompleteness.error = action.payload;
      })

      // API 3: Dashboard Plans
      .addCase(fetchDashboardPlans.pending, (state) => {
        state.dashboardPlans.loading = true;
        state.dashboardPlans.error = null;
      })
      .addCase(fetchDashboardPlans.fulfilled, (state, action) => {
        state.dashboardPlans.loading = false;
        if (action.payload) {
          state.dashboardPlans.currentPlan = action.payload.currentPlan || null;
          state.dashboardPlans.availablePlans = Array.isArray(action.payload.availablePlans)
            ? action.payload.availablePlans
            : [];
        }
      })
      .addCase(fetchDashboardPlans.rejected, (state, action) => {
        state.dashboardPlans.loading = false;
        state.dashboardPlans.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;