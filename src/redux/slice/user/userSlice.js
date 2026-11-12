// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const BASE_URL = "https://new-job-portal-be.onrender.com";

// // 🔍 FETCH USER DETAILS
// export const fetchUserDetails = createAsyncThunk(
//   "user/fetchUserDetails",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.get(
//         `${BASE_URL}/api/auth/jobseeker/fetchUserDetails`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       return res.data;
//     } catch (error) {
//       return rejectWithValue("Failed to fetch user details");
//     }
//   }
// );

// // ✏️ UPDATE PROFILE
// export const updateUserProfile = createAsyncThunk(
//   "user/updateUserProfile",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.post(
//         `${BASE_URL}/api/auth/jobseeker/updateProfile`,
//         payload,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Update failed");
//     }
//   }
// );

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     user: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUserDetails.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchUserDetails.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//       })
//       .addCase(fetchUserDetails.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       .addCase(updateUserProfile.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(updateUserProfile.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//       })
//       .addCase(updateUserProfile.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default userSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "../../../utils/apiBase";
import {
  updateBasicDetailsApi,
  updateSkillsAndPreferencesApi,
  addEducationApi,
  updateEducationApi,
  deleteEducationApi,
  addExperienceApi,
  updateExperienceApi,
  deleteExperienceApi,
  addCertificationApi,
  updateCertificationApi,
  deleteCertificationApi,
  uploadDocumentsApi,
  deleteDocumentApi,
} from "../../../services/candidateProfileService";

/* ================= FETCH USER ================= */
export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        getApiUrl("/api/auth/jobseeker/fetchUserDetails"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("employerToken");
        localStorage.removeItem("authToken");
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user details"
      );
    }
  }
);

/* ================= MODULE 1: BASIC DETAILS (PATCH) ================= */
export const updateBasicDetails = createAsyncThunk(
  "user/updateBasicDetails",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await updateBasicDetailsApi(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to update basic details"
      );
    }
  }
);

/* ================= MODULE 2: SKILLS & PREFERENCES (PATCH) ================= */
export const updateSkillsAndPreferences = createAsyncThunk(
  "user/updateSkillsAndPreferences",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await updateSkillsAndPreferencesApi(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to update skills and preferences"
      );
    }
  }
);

/* ================= MODULE 3: EDUCATION CRUD ================= */
export const addEducation = createAsyncThunk(
  "user/addEducation",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await addEducationApi(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to add education"
      );
    }
  }
);

export const updateEducation = createAsyncThunk(
  "user/updateEducation",
  async ({ eduId, payload }, { rejectWithValue }) => {
    try {
      const data = await updateEducationApi(eduId, payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to update education"
      );
    }
  }
);

export const deleteEducation = createAsyncThunk(
  "user/deleteEducation",
  async (eduId, { rejectWithValue }) => {
    try {
      const data = await deleteEducationApi(eduId);
      return { eduId, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to delete education"
      );
    }
  }
);

/* ================= MODULE 4: EXPERIENCE CRUD ================= */
export const addExperience = createAsyncThunk(
  "user/addExperience",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await addExperienceApi(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to add experience"
      );
    }
  }
);

export const updateExperience = createAsyncThunk(
  "user/updateExperience",
  async ({ expId, payload }, { rejectWithValue }) => {
    try {
      const data = await updateExperienceApi(expId, payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to update experience"
      );
    }
  }
);

export const deleteExperience = createAsyncThunk(
  "user/deleteExperience",
  async (expId, { rejectWithValue }) => {
    try {
      const data = await deleteExperienceApi(expId);
      return { expId, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || "Failed to delete experience"
      );
    }
  }
);

/* ================= MODULE 5: CERTIFICATION CRUD (API 12) ================= */
export const addCertification = createAsyncThunk(
  "user/addCertification",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await addCertificationApi(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add certification"
      );
    }
  }
);

/* ================= UPDATE CERTIFICATION (API 13) ================= */
export const updateCertification = createAsyncThunk(
  "user/updateCertification",
  async ({ certId, payload }, { rejectWithValue }) => {
    try {
      const data = await updateCertificationApi(certId, payload);
      return { certId, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update certification"
      );
    }
  }
);

/* ================= DELETE CERTIFICATION (API 14) ================= */
export const deleteCertification = createAsyncThunk(
  "user/deleteCertification",
  async (certId, { rejectWithValue }) => {
    try {
      const data = await deleteCertificationApi(certId);
      return { certId, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete certification"
      );
    }
  }
);

/* ================= UPLOAD DOCUMENTS (API 15) ================= */
export const uploadDocuments = createAsyncThunk(
  "user/uploadDocuments",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await uploadDocumentsApi(formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to upload documents"
      );
    }
  }
);

/* ================= DELETE DOCUMENT (API 16) ================= */
export const deleteDocument = createAsyncThunk(
  "user/deleteDocument",
  async (fieldName, { rejectWithValue }) => {
    try {
      const data = await deleteDocumentApi(fieldName);
      return { fieldName, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete document"
      );
    }
  }
);

/* ================= UPDATE PROFILE (FORM DATA - LEGACY / FULL) ================= */
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async ({ payload }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        getApiUrl("/api/auth/jobseeker/updateProfile"),
        payload, // ✅ FormData directly
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // ✅ REQUIRED
          },
        }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

/* ================= SLICE ================= */
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    removeProfilePhoto: (state) => {
      if (state.user?.documents) {
        state.user.documents.photo = "";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE BASIC DETAILS */
      .addCase(updateBasicDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBasicDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data && state.user) {
          state.user = {
            ...state.user,
            fullName: action.payload.data.fullName || state.user.fullName,
            about: action.payload.data.about ?? state.user.about,
            basicDetails: {
              ...(state.user.basicDetails || {}),
              ...(action.payload.data.basicDetails || {}),
            },
          };
        }
      })
      .addCase(updateBasicDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE SKILLS & PREFERENCES */
      .addCase(updateSkillsAndPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSkillsAndPreferences.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data && state.user) {
          state.user = {
            ...state.user,
            skillsAndPreference: {
              ...(state.user.skillsAndPreference || {}),
              ...(action.payload.data.skillsAndPreference || {}),
            },
          };
        }
      })
      .addCase(updateSkillsAndPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ADD EDUCATION */
      .addCase(addEducation.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEducation.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload?.data) && state.user) {
          state.user.educationDetails = action.payload.data;
        }
      })
      .addCase(addEducation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE EDUCATION */
      .addCase(updateEducation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEducation.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload?.data) && state.user) {
          state.user.educationDetails = action.payload.data;
        }
      })
      .addCase(updateEducation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE EDUCATION */
      .addCase(deleteEducation.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEducation.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload?.data) && state.user) {
          state.user.educationDetails = action.payload.data;
        } else if (state.user?.educationDetails) {
          state.user.educationDetails = state.user.educationDetails.filter(
            (e) => e._id !== action.payload.eduId
          );
        }
      })
      .addCase(deleteEducation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ADD EXPERIENCE */
      .addCase(addExperience.pending, (state) => {
        state.loading = true;
      })
      .addCase(addExperience.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data && state.user) {
          state.user.workExperience = action.payload.data;
        }
      })
      .addCase(addExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE EXPERIENCE */
      .addCase(updateExperience.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateExperience.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data && state.user) {
          // If returned data is an array or object
          if (Array.isArray(action.payload.data)) {
            state.user.workExperience = {
              ...(state.user.workExperience || {}),
              experiences: action.payload.data,
            };
          } else {
            state.user.workExperience = action.payload.data;
          }
        }
      })
      .addCase(updateExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE EXPERIENCE */
      .addCase(deleteExperience.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteExperience.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data?.data || action.payload?.data;
        if (resData && typeof resData === "object" && Array.isArray(resData.experiences) && state.user) {
          state.user.workExperience = resData;
        } else if (state.user?.workExperience?.experiences) {
          state.user.workExperience.experiences = state.user.workExperience.experiences.filter(
            (exp) => exp._id !== action.payload.expId
          );
        }
      })
      .addCase(deleteExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ADD CERTIFICATION (API 12) */
      .addCase(addCertification.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCertification.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload?.data) && state.user) {
          state.user.certifications = action.payload.data;
        }
      })
      .addCase(addCertification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE CERTIFICATION (API 13) */
      .addCase(updateCertification.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCertification.fulfilled, (state, action) => {
        state.loading = false;
        const certList = action.payload?.data?.data || action.payload?.data;
        if (Array.isArray(certList) && state.user) {
          state.user.certifications = certList;
        } else if (state.user?.certifications) {
          const updatedItem = action.payload?.data;
          state.user.certifications = state.user.certifications.map((c) =>
            c._id === action.payload.certId ? (updatedItem?.certificationName ? updatedItem : c) : c
          );
        }
      })
      .addCase(updateCertification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE CERTIFICATION (API 14) */
      .addCase(deleteCertification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCertification.fulfilled, (state, action) => {
        state.loading = false;
        const certList = action.payload?.data?.data || action.payload?.data;
        if (Array.isArray(certList) && certList.length > 0 && state.user) {
          state.user.certifications = certList;
        } else if (state.user?.certifications) {
          state.user.certifications = state.user.certifications.filter(
            (c) => c._id !== action.payload.certId
          );
        }
      })
      .addCase(deleteCertification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPLOAD DOCUMENTS (API 15) */
      .addCase(uploadDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.loading = false;
        const docs = action.payload?.data || action.payload;
        if (docs && state.user) {
          state.user.documents = {
            ...(state.user.documents || {}),
            ...docs,
          };
        }
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE DOCUMENT (API 16) */
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        const docs = action.payload?.data?.data || action.payload?.data;
        if (docs && typeof docs === "object" && state.user) {
          state.user.documents = {
            ...(state.user.documents || {}),
            ...docs,
          };
        } else if (state.user?.documents && action.payload?.fieldName) {
          state.user.documents[action.payload.fieldName] = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* LEGACY UPDATE USER PROFILE */
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
export const { removeProfilePhoto } = userSlice.actions;