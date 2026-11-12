import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 API CALL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://new-job-portal-be-2f6y.onrender.com";
export const fetchPopularCategories = createAsyncThunk(
    "popularCategories/fetchPopularCategories",
    async (_, { rejectWithValue }) => {
        try {
            const cleanBase = BASE_URL.replace(/\/+$/, "");
            const res = await axios.get(
                `${cleanBase}/api/info/popular-categories`
            );
            return res.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error fetching categories");
        }
    }
);

const popularCategoriesSlice = createSlice({
    name: "popularCategories",
    initialState: {
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPopularCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPopularCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = Array.isArray(action.payload)
                    ? action.payload
                    : (action.payload?.data && Array.isArray(action.payload.data))
                        ? action.payload.data
                        : (action.payload?.categories && Array.isArray(action.payload.categories))
                            ? action.payload.categories
                            : [];
            })
            .addCase(fetchPopularCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.categories = [];
            });
    },
});

export default popularCategoriesSlice.reducer;