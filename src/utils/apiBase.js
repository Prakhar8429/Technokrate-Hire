/**
 * Shared API configuration and URL resolution helper
 */
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://new-job-portal-be-dh8v.onrender.com";

export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

/**
 * Returns a well-formed API URL without duplicate slashes.
 * e.g., getApiUrl("/api/auth/jobseeker/login")
 */
export const getApiUrl = (path = "") => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default API_BASE_URL;
