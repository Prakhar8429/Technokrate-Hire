import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";

// 🔐 LOGIN WITH EMAIL & PASSWORD
export const loginWithPassword = createAsyncThunk(
    "login/loginWithPassword",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                getApiUrl("/api/auth/jobseeker/login"),
                {
                    email: email?.trim(),
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Invalid email or password"
            );
        }
    }
);

// 🔐 LOGIN STEP 1: Request Mobile OTP
export const requestLoginOtp = createAsyncThunk(
    "login/requestLoginOtp",
    async ({ mobileNumber }, { rejectWithValue }) => {
        try {
            const res = await axios.post(getApiUrl("api/auth/jobseeker/send-login-otp"), {
                mobileNumber,
            });
            return res.data; // Expected: { message, otp }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to send OTP"
            );
        }
    }
);

// 🔐 LOGIN STEP 2: Verify Mobile OTP & Sign In
export const verifyLoginOtp = createAsyncThunk(
    "login/verifyLoginOtp",
    async ({ mobileNumber, otp }, { rejectWithValue }) => {
        try {
            const res = await axios.post(getApiUrl("api/auth/jobseeker/verify-otp"), {
                mobileNumber,
                otp,
            });
            return res.data; // Expected: { message, token, _id, role, profileCompleted }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "OTP verification failed"
            );
        }
    }
);

// 🔐 LOGIN STEP 1: Request Email OTP
export const requestEmailLoginOtp = createAsyncThunk(
    "login/requestEmailLoginOtp",
    async ({ email }, { rejectWithValue }) => {
        try {
            const res = await axios.post(getApiUrl("api/auth/jobseeker/send-email-login-otp"), {
                email,
            });
            return res.data; // Expected: { message, otp }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to send email OTP"
            );
        }
    }
);

// 🔐 LOGIN STEP 2: Verify Email OTP & Sign In
export const verifyEmailLoginOtp = createAsyncThunk(
    "login/verifyEmailLoginOtp",
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const res = await axios.post(getApiUrl("api/auth/jobseeker/verify-email-login-otp"), {
                email,
                otp,
            });
            return res.data; // Expected: { message, token, _id, role, profileCompleted }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Email OTP verification failed"
            );
        }
    }
);

// 🌐 GOOGLE AUTH (Login & Sign Up with Strict Mode)
export const googleAuthUser = createAsyncThunk(
    "login/googleAuthUser",
    async ({ idToken, profile, mode }, { rejectWithValue }) => {
        try {
            const res = await axios.post(getApiUrl("api/auth/jobseeker/google-auth"), {
                idToken,
                profile,
                mode: mode || "login",
            });
            return res.data; // Expected: { message, token, user / _id, role }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Google authentication failed"
            );
        }
    }
);

const safeJSONParse = (key, fallback = null) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined" || item === "null") return fallback;
        return JSON.parse(item);
    } catch (e) {
        return fallback;
    }
};

const loginSlice = createSlice({
    name: "login",
    initialState: {
        user: safeJSONParse("user", null),
        token: localStorage.getItem("token") || null,
        tempMobileNumber: null,
        tempEmail: null,
        loading: false,
        error: null,
        step: 1, // 1 for mobile/email input, 2 for OTP verify
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.tempMobileNumber = null;
            state.tempEmail = null;
            state.step = 1;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
        clearLoginError: (state) => {
            state.error = null;
        },
        setLoginStep: (state, action) => {
            state.step = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Request Mobile OTP
            .addCase(requestLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestLoginOtp.fulfilled, (state) => {
                state.loading = false;
                state.step = 2;
            })
            .addCase(requestLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify Mobile OTP
            .addCase(verifyLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyLoginOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.token = action.payload.token;
                state.step = 1;

                if (action.payload.token) {
                    localStorage.setItem("token", action.payload.token);
                }
                localStorage.setItem("user", JSON.stringify(action.payload));
            })
            .addCase(verifyLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Request Email OTP
            .addCase(requestEmailLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestEmailLoginOtp.fulfilled, (state) => {
                state.loading = false;
                state.step = 2;
            })
            .addCase(requestEmailLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify Email OTP
            .addCase(verifyEmailLoginOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmailLoginOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.token = action.payload.token;
                state.step = 1;

                if (action.payload.token) {
                    localStorage.setItem("token", action.payload.token);
                }
                localStorage.setItem("user", JSON.stringify(action.payload));
            })
            .addCase(verifyEmailLoginOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Google Auth
            .addCase(googleAuthUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleAuthUser.fulfilled, (state, action) => {
                state.loading = false;
                const mode = action.meta?.arg?.mode;
                if (mode !== "signup") {
                    const userData = action.payload.user || action.payload;
                    const tokenData = action.payload.token || userData?.token;
                    state.user = userData;
                    state.token = tokenData;
                    state.step = 1;

                    if (tokenData) {
                        localStorage.setItem("token", tokenData);
                    }
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            })
            // Email + Password Login
            .addCase(loginWithPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginWithPassword.fulfilled, (state, action) => {
                state.loading = false;
                const tokenData = action.payload.token || action.payload.user?.token;
                const userObj = action.payload.user || action.payload;
                const userData = {
                    ...userObj,
                    _id: userObj._id || action.payload._id,
                    fullName: userObj.fullName || action.payload.fullName,
                    email: userObj.email || action.payload.email,
                    mobileNumber: userObj.mobileNumber || action.payload.mobileNumber,
                    role: userObj.role || action.payload.role || "JOB_SEEKER",
                    isVerified: userObj.isVerified ?? action.payload.isVerified,
                    profileCompleted: userObj.profileCompleted ?? action.payload.profileCompleted,
                };
                state.user = userData;
                state.token = tokenData;
                state.step = 1;

                if (tokenData) {
                    localStorage.setItem("token", tokenData);
                }
                localStorage.setItem("user", JSON.stringify(userData));
            })
            .addCase(loginWithPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearLoginError, setLoginStep } = loginSlice.actions;
export default loginSlice.reducer;