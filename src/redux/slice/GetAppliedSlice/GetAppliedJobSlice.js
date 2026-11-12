import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";
import {
  checkAppliedStatusApi,
  withdrawApplicationApi,
} from "../../../services/candidateProfileService";

// ✅ Fetch applied jobs
export const fetchAppliedJobs = createAsyncThunk(
  "appliedJobs/fetchAppliedJobs",
  async (token, { rejectWithValue }) => {
    try {
      const activeToken =
        token ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      const res = await axios.get(
        getApiUrl("/api/jobseeker/job-alert/getAppliedJobs"),
        {
          headers: {
            Authorization: `Bearer ${activeToken || ""}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.data; // array of applied jobs
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Error fetching applied jobs"
      );
    }
  }
);

// ✅ Check Applied Status (API 17)
export const checkAppliedStatus = createAsyncThunk(
  "appliedJobs/checkAppliedStatus",
  async (jobId, { rejectWithValue }) => {
    try {
      const data = await checkAppliedStatusApi(jobId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error checking application status"
      );
    }
  }
);

// ✅ Withdraw Application (API 18)
export const withdrawApplication = createAsyncThunk(
  "appliedJobs/withdrawApplication",
  async (applicationId, { rejectWithValue }) => {
    try {
      const data = await withdrawApplicationApi(applicationId);
      return { applicationId, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error withdrawing application"
      );
    }
  }
);

const appliedJobsSlice = createSlice({
  name: "appliedJobs",
  initialState: {
    appliedJobs: [],
    loading: false,
    error: null,
    withdrawLoading: false,
    withdrawError: null,
  },
  reducers: {
    addAppliedJob: (state, action) => {
      state.appliedJobs.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH APPLIED JOBS */
      .addCase(fetchAppliedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppliedJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedJobs = action.payload || [];
      })
      .addCase(fetchAppliedJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* WITHDRAW APPLICATION (API 18) */
      .addCase(withdrawApplication.pending, (state) => {
        state.withdrawLoading = true;
        state.withdrawError = null;
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.withdrawLoading = false;
        const appId = action.payload.applicationId;
        state.appliedJobs = state.appliedJobs.filter(
          (job) =>
            job._id !== appId &&
            job.id !== appId &&
            job.applicationId !== appId
        );
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.withdrawLoading = false;
        state.withdrawError = action.payload;
      });
  },
});

export const { addAppliedJob } = appliedJobsSlice.actions;
export default appliedJobsSlice.reducer;