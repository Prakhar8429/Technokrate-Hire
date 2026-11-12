import axios from "axios";
import { getApiUrl } from "../utils/apiBase";

/**
 * Helper to construct authentication headers with Bearer token.
 */
const getAuthHeaders = (isMultipart = false) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  const headers = {
    Authorization: `Bearer ${token || ""}`,
  };

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  return { headers };
};

// ============================================================================
// MODULE 1: Update Basic Details (PATCH)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/basic-details
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/basic-details
// ============================================================================
export const updateBasicDetailsApi = async (payload) => {
  const url = getApiUrl("/api/auth/jobseeker/profile/basic-details");
  const response = await axios.patch(url, payload, getAuthHeaders());
  return response.data;
};

// ============================================================================
// MODULE 2: Update Skills & Preferences (PATCH)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/skills-preferences
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/skills-preferences
// ============================================================================
export const updateSkillsAndPreferencesApi = async (payload) => {
  const url = getApiUrl("/api/auth/jobseeker/profile/skills-preferences");
  const response = await axios.patch(url, payload, getAuthHeaders());
  return response.data;
};

// ============================================================================
// MODULE 3: Education Management (CRUD)
// ============================================================================

// 3.1 Add Education (POST)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/education
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/education
export const addEducationApi = async (payload) => {
  const url = getApiUrl("/api/auth/jobseeker/profile/education");
  const response = await axios.post(url, payload, getAuthHeaders());
  return response.data;
};

// 3.2 Update Education (PUT)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/education/:eduId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/education/:eduId
export const updateEducationApi = async (eduId, payload) => {
  if (!eduId) throw new Error("Education ID is required for update");
  const url = getApiUrl(`/api/auth/jobseeker/profile/education/${eduId}`);
  const response = await axios.put(url, payload, getAuthHeaders());
  return response.data;
};

// 3.3 Delete Education (DELETE)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/education/:eduId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/education/:eduId
export const deleteEducationApi = async (eduId) => {
  if (!eduId) throw new Error("Education ID is required for deletion");
  const url = getApiUrl(`/api/auth/jobseeker/profile/education/${eduId}`);
  const response = await axios.delete(url, getAuthHeaders());
  return response.data;
};

// ============================================================================
// MODULE 4: Experience Management (CRUD)
// ============================================================================

// 4.1 Add Experience (POST)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/experience
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/experience
export const addExperienceApi = async (payload) => {
  const url = getApiUrl("/api/auth/jobseeker/profile/experience");
  const response = await axios.post(url, payload, getAuthHeaders());
  return response.data;
};

// 4.2 Update Experience (PUT)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/experience/:expId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/experience/:expId
export const updateExperienceApi = async (expId, payload) => {
  if (!expId) throw new Error("Experience ID is required for update");
  const url = getApiUrl(`/api/auth/jobseeker/profile/experience/${expId}`);
  const response = await axios.put(url, payload, getAuthHeaders());
  return response.data;
};

// 4.3 Delete Experience (DELETE)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/experience/:expId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/experience/:expId
export const deleteExperienceApi = async (expId) => {
  if (!expId) throw new Error("Experience ID is required for deletion");
  const url = getApiUrl(`/api/auth/jobseeker/profile/experience/${expId}`);
  const response = await axios.delete(url, getAuthHeaders());
  return response.data;
};

// ============================================================================
// MODULE 5: Certification Management (API 12, 13, 14)
// ============================================================================

// 5.1 Add Certification (POST) (API 12)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/certification
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/certification
export const addCertificationApi = async (payload) => {
  const url = getApiUrl("/api/auth/jobseeker/profile/certification");
  const response = await axios.post(url, payload, getAuthHeaders());
  return response.data;
};

// 5.2 Update Certification (PUT) (API 13)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/certification/:certId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/certification/:certId
export const updateCertificationApi = async (certId, payload) => {
  if (!certId) throw new Error("Certification ID is required for update");
  const url = getApiUrl(`/api/auth/jobseeker/profile/certification/${certId}`);
  const response = await axios.put(url, payload, getAuthHeaders());
  return response.data;
};

// 5.3 Delete Certification (DELETE) (API 14)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/certification/:certId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/certification/:certId
export const deleteCertificationApi = async (certId) => {
  if (!certId) throw new Error("Certification ID is required for deletion");
  const url = getApiUrl(`/api/auth/jobseeker/profile/certification/${certId}`);
  const response = await axios.delete(url, getAuthHeaders());
  return response.data;
};

// ============================================================================
// MODULE 6: Document Management (API 15, 16)
// ============================================================================

// 6.1 Upload Documents (PATCH) (API 15)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/documents
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/documents
export const uploadDocumentsApi = async (formData) => {
  const url = getApiUrl("/api/auth/jobseeker/profile/documents");
  const response = await axios.patch(url, formData, getAuthHeaders(true));
  return response.data;
};

// 6.2 Delete Document (DELETE) (API 16)
// Localhost: http://localhost:3000/api/auth/jobseeker/profile/documents/:fieldName
// Live: https://new-job-portal-be-dh8v.onrender.com/api/auth/jobseeker/profile/documents/:fieldName
export const deleteDocumentApi = async (fieldName) => {
  if (!fieldName) throw new Error("Document field name is required for deletion");
  const url = getApiUrl(`/api/auth/jobseeker/profile/documents/${fieldName}`);
  const response = await axios.delete(url, getAuthHeaders());
  return response.data;
};

// ============================================================================
// MODULE 7: Job Application Status & Withdrawal (API 17, 18)
// ============================================================================

// 7.1 Check Applied Status (GET) (API 17)
// Localhost: http://localhost:3000/api/jobseeker/job-alert/check-applied/:jobId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/jobseeker/job-alert/check-applied/:jobId
export const checkAppliedStatusApi = async (jobId) => {
  if (!jobId) throw new Error("Job ID is required to check applied status");
  const url = getApiUrl(`/api/jobseeker/job-alert/check-applied/${jobId}`);
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

// 7.2 Withdraw Application (DELETE) (API 18)
// Localhost: http://localhost:3000/api/jobseeker/applied-jobs/withdraw/:applicationId
// Live: https://new-job-portal-be-dh8v.onrender.com/api/jobseeker/applied-jobs/withdraw/:applicationId
export const withdrawApplicationApi = async (applicationId) => {
  if (!applicationId) throw new Error("Application ID is required to withdraw");
  const url = getApiUrl(`/api/jobseeker/applied-jobs/withdraw/${applicationId}`);
  const response = await axios.delete(url, getAuthHeaders());
  return response.data;
};

// ============================================================================
// DASHBOARD APIs (Module 1, 2, 3)
// ============================================================================

// API 1: Profile Completeness (GET)
// Localhost: http://localhost:3000/api/jobseeker/dashboard/profile-completeness
// Live: https://new-job-portal-be-dh8v.onrender.com/api/jobseeker/dashboard/profile-completeness
export const getProfileCompletenessApi = async () => {
  const url = getApiUrl("/api/jobseeker/dashboard/profile-completeness");
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

// API 2: Notifications (GET)
// Localhost: http://localhost:3000/api/jobseeker/dashboard/notifications
// Live: https://new-job-portal-be-dh8v.onrender.com/api/jobseeker/dashboard/notifications
export const getNotificationsApi = async () => {
  const url = getApiUrl("/api/jobseeker/dashboard/notifications");
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

// API 3: Dashboard Plans (GET)
// Localhost: http://localhost:3000/api/jobseeker/dashboard/plans
// Live: https://new-job-portal-be-dh8v.onrender.com/api/jobseeker/dashboard/plans
export const getDashboardPlansApi = async () => {
  const url = getApiUrl("/api/jobseeker/dashboard/plans");
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

export default {
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
  checkAppliedStatusApi,
  withdrawApplicationApi,
  getProfileCompletenessApi,
  getNotificationsApi,
  getDashboardPlansApi,
};

