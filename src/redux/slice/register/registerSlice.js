import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";

// 🔹 Register Thunk
export const registerUser = createAsyncThunk(
    "register/registerUser",
    async (values, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                getApiUrl("/api/auth/jobseeker/signup/send-otp"),
                values,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error) {
            const backendError = error.response?.data;
            const message = backendError?.message || error.message || "Failed to register";
            return rejectWithValue(backendError || message);
        }
    }
);

const registerSlice = createSlice({
    name: "register",
    initialState: {
        loading: false,
        success: false,
        error: null,
        user: null,
    },
    reducers: {
        resetRegisterState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // 🔄 Pending
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // ✅ Success
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload;
            })
            // ❌ Error
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;