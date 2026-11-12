import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";

/* ================= CANDIDATE FORGOT PASSWORD - STEP 1 (SEND OTP TO EMAIL) ================= */
export const sendForgotPasswordOtp = createAsyncThunk(
    "forgotPassword/sendOtp",
    async (email, { rejectWithValue }) => {
        const cleanEmail = typeof email === "string" ? email.trim() : email?.email?.trim();
        try {
            const res = await axios.post(
                getApiUrl("/api/auth/jobseeker/forget-pass-sendotp"),
                { email: cleanEmail },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return res.data;
        } catch (error) {
            // Check if route 404 (not "user not found"), retry with alias
            const errMsg = error.response?.data?.message || "";
            if (error.response?.status === 404 && !errMsg.toLowerCase().includes("user")) {
                try {
                    const aliasRes = await axios.post(
                        getApiUrl("/api/auth/jobseeker/forgot-password"),
                        { email: cleanEmail },
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    return aliasRes.data;
                } catch (aliasErr) {
                    return rejectWithValue(
                        aliasErr.response?.data?.message || "Failed to send OTP to email"
                    );
                }
            }
            return rejectWithValue(
                error.response?.data?.message || "Failed to send OTP to email"
            );
        }
    }
);

/* ================= SLICE ================= */

const forgotPasswordSlice = createSlice({
    name: "forgotPassword",
    initialState: {
        loading: false,
        error: null,
        success: false,
        message: null,
    },
    reducers: {
        resetForgotPasswordState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendForgotPasswordOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(sendForgotPasswordOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || "OTP sent to your email";
            })
            .addCase(sendForgotPasswordOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to send OTP to email";
                state.success = false;
            });
    },
});

export const { resetForgotPasswordState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;