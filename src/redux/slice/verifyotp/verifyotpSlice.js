import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";

/* ================= CANDIDATE FORGOT PASSWORD - STEP 2 (VERIFY OTP) ================= */
export const verifyForgotPasswordOtp = createAsyncThunk(
    "forgotpasswordotp/verifyOtp",
    async ({ email, otp }, { rejectWithValue }) => {
        const cleanEmail = typeof email === "string" ? email.trim() : email?.email?.trim();
        const cleanOtp = typeof otp === "string" ? otp.trim() : String(otp || "").trim();

        try {
            const res = await axios.post(
                getApiUrl("/api/auth/jobseeker/verify-pass-otp"),
                {
                    email: cleanEmail,
                    otp: cleanOtp,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return res.data;
        } catch (error) {
            // Check if route 404, retry with alias
            const errMsg = error.response?.data?.message || "";
            if (error.response?.status === 404 && !errMsg.toLowerCase().includes("user")) {
                try {
                    const aliasRes = await axios.post(
                        getApiUrl("/api/auth/jobseeker/verify-password-otp"),
                        {
                            email: cleanEmail,
                            otp: cleanOtp,
                        },
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    return aliasRes.data;
                } catch (aliasErr) {
                    return rejectWithValue(
                        aliasErr.response?.data?.message || "OTP verification failed"
                    );
                }
            }
            return rejectWithValue(
                error.response?.data?.message || "OTP verification failed"
            );
        }
    }
);

const forgotPasswordOtpSlice = createSlice({
    name: "forgotPasswordOtp",
    initialState: {
        loading: false,
        success: false,
        error: null,
        data: null,
        isVerified: false,
    },
    reducers: {
        resetOtpState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.data = null;
            state.isVerified = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyForgotPasswordOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(verifyForgotPasswordOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload;
                state.isVerified = true;
            })
            .addCase(verifyForgotPasswordOtp.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
                state.isVerified = false;
            });
    },
});

export const { resetOtpState } = forgotPasswordOtpSlice.actions;
// Backward compatibility with previous export
export const resetState = forgotPasswordOtpSlice.actions.resetOtpState;

export default forgotPasswordOtpSlice.reducer;