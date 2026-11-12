import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";

/* ================= CANDIDATE FORGOT PASSWORD - STEP 3 (RESET PASSWORD) ================= */
export const resetPassword = createAsyncThunk(
    "resetpassword/reset",
    async ({ email, newPassword }, { rejectWithValue }) => {
        const cleanEmail = typeof email === "string" ? email.trim() : email?.email?.trim();

        const payload = {
            email: cleanEmail,
            newPassword,
        };

        const headers = {
            "Content-Type": "application/json",
        };

        // Try primary URL with POST
        try {
            const res = await axios.post(
                getApiUrl("/api/auth/jobseeker/resetpassword"),
                payload,
                { headers }
            );
            return res.data;
        } catch (error) {
            // If 405 Method Not Allowed, try PATCH on primary URL
            if (error.response?.status === 405) {
                try {
                    const patchRes = await axios.patch(
                        getApiUrl("/api/auth/jobseeker/resetpassword"),
                        payload,
                        { headers }
                    );
                    return patchRes.data;
                } catch (patchErr) {
                    return rejectWithValue(
                        patchErr.response?.data?.message || "Password reset failed"
                    );
                }
            }

            // If 404 route error (not user not found), try alias /reset-password
            const errMsg = error.response?.data?.message || "";
            if (error.response?.status === 404 && !errMsg.toLowerCase().includes("user")) {
                try {
                    const aliasRes = await axios.post(
                        getApiUrl("/api/auth/jobseeker/reset-password"),
                        payload,
                        { headers }
                    );
                    return aliasRes.data;
                } catch (aliasErr) {
                    if (aliasErr.response?.status === 405) {
                        try {
                            const aliasPatchRes = await axios.patch(
                                getApiUrl("/api/auth/jobseeker/reset-password"),
                                payload,
                                { headers }
                            );
                            return aliasPatchRes.data;
                        } catch (aliasPatchErr) {
                            return rejectWithValue(
                                aliasPatchErr.response?.data?.message || "Password reset failed"
                            );
                        }
                    }
                    return rejectWithValue(
                        aliasErr.response?.data?.message || "Password reset failed"
                    );
                }
            }

            return rejectWithValue(
                error.response?.data?.message || "Password reset failed"
            );
        }
    }
);

const resetPasswordSlice = createSlice({
    name: "resetpassword",
    initialState: {
        loading: false,
        success: false,
        error: null,
        data: null,
    },
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.data = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.data = action.payload;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            });
    },
});

export const { resetState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;