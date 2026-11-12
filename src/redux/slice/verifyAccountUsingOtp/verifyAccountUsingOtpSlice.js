// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // Async thunk for account verification
// export const verifyAccount = createAsyncThunk(
//     "account/verify",
//     async ({ email, otp }, { rejectWithValue }) => {
//         try {
//             const response = await fetch(
//                 "https://new-job-portal-be.onrender.com/api/auth/jobseeker/verify-account",
//                 {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({ email, otp }),
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 return rejectWithValue(data.message || "Verification failed");
//             }

//             return data; // { message: "Account verified successfully" }
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

// const verifyAccountSlice = createSlice({
//     name: "accountVerification",
//     initialState: {
//         loading: false,
//         success: false,
//         error: null,
//         data: null,
//         isVerified: false,
//     },
//     reducers: {
//         resetState: (state) => {
//             state.loading = false;
//             state.success = false;
//             state.error = null;
//             state.data = null;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(verifyAccount.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//                 state.success = false;

//             })
//             .addCase(verifyAccount.fulfilled, (state, action) => {

//                 state.loading = false;
//                 state.success = true;
//                 state.data = action.payload;
//                 state.isVerified = action.payload.isVerified;

//             })
//             .addCase(verifyAccount.rejected, (state, action) => {
//                 state.loading = false;
//                 state.success = false;
//                 state.error = action.payload;
//             });
//     },
// });

// export const { resetState } = verifyAccountSlice.actions;

// export default verifyAccountSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";

export const verifyAccount = createAsyncThunk(
    "account/verify",
    async ({ mobileNumber, otp }, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                getApiUrl("/api/auth/jobseeker/signup/verify-otp"),
                { mobileNumber, otp },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Verification failed"
            );
        }
    }
);

const safeJSONParse = (key, fallback = false) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined" || item === "null") return fallback;
        return JSON.parse(item);
    } catch (e) {
        return fallback;
    }
};

const verifyAccountSlice = createSlice({
    name: "accountVerification",
    initialState: {
        loading: false,
        success: false,
        error: null,
        data: null,
        isVerified: safeJSONParse("isVerified", false),
    },
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.data = null;
            localStorage.removeItem("isVerified");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(verifyAccount.fulfilled, (state, action) => {
                console.log("FULL API PAYLOAD:", action.payload);

                state.loading = false;
                state.success = true;
                state.data = action.payload;
                const verifiedStatus = typeof action.payload?.isVerified === "boolean" 
                    ? action.payload.isVerified 
                    : true;
                state.isVerified = verifiedStatus;
                localStorage.setItem("isVerified", JSON.stringify(verifiedStatus));
                console.log("Redux state.isVerified:", state.isVerified);
            })
            .addCase(verifyAccount.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
                state.isVerified = false;
                localStorage.setItem("isVerified", "false");
            });
    },
});

export const { resetState } = verifyAccountSlice.actions;

export default verifyAccountSlice.reducer;