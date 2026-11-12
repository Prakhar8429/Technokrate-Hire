import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";

export const sendOtp = createAsyncThunk(
    "otp/sendOtp",
    async ({ email, method }, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                getApiUrl("/api/auth/jobseeker/send-verification-otp"),
                { email, method },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            return { ...res.data, method }; // include method in the state
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Something went wrong"
            );
        }
    }
);

const otpSlice = createSlice({
    name: "otp",
    initialState: {
        loading: false,
        error: null,
        lastOtp: null,
        otpMethod: null,
        emailVerified: false,
        phoneVerified: false,
    },
    reducers: {
        resetOtpState: (state) => {
            state.loading = false;
            state.error = null;
            state.lastOtp = null;
            state.otpMethod = null;
            state.emailVerified = false;
            state.phoneVerified = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.lastOtp = action.payload.otp;
                state.otpMethod = action.payload.method;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetOtpState } = otpSlice.actions;
export default otpSlice.reducer;