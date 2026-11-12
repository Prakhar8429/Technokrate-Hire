export const API_BASE_URL = 'https://new-job-portal-be-dh8v.onrender.com';

export const API_ENDPOINTS = {
  // Auth - Jobseeker
  REGISTER: '/api/auth/jobseeker/register',
  SIGNUP_SEND_OTP: '/api/auth/jobseeker/signup/send-otp',
  SIGNUP_VERIFY_OTP: '/api/auth/jobseeker/signup/verify-otp',
  LOGIN: '/api/auth/jobseeker/login',
  SEND_LOGIN_OTP: '/api/auth/jobseeker/send-login-otp',
  VERIFY_LOGIN_OTP: '/api/auth/jobseeker/verify-otp',
  SEND_VERIFY_OTP: '/api/auth/jobseeker/send-verification-otp',
  VERIFY_ACCOUNT: '/api/auth/jobseeker/verify-account',
  FORGOT_PASS_SEND_OTP: '/api/auth/jobseeker/forget-pass-sendotp',
  VERIFY_PASS_OTP: '/api/auth/jobseeker/verify-pass-otp',
  RESET_PASSWORD: '/api/auth/jobseeker/resetpassword',
  
  // Profile
  PROFILE: '/api/auth/jobseeker/profile',
  FETCH_USER_DETAILS: '/api/auth/jobseeker/fetchUserDetails',
  FETCH_USER_DETAILS_ALT: '/api/auth/jobseeker/userdetails',
  UPDATE_PROFILE: '/api/auth/jobseeker/updateProfile',
  FULL_PROFILE_DETAILS: '/api/auth/jobseeker/full-profile-details',
  CATEGORIES: '/api/auth/jobseeker/getCategories',
  SUB_CATEGORIES: (id) => `/api/auth/jobseeker/getSubCategories/${id}`,
  DESIGNATIONS: (id) => `/api/auth/jobseeker/getDesignation/${id}`,
  CATEGORY_STATISTICS: '/api/admin/jobSeeker/category/statistics',
  
  // Jobs & Search
  SEARCH_JOBS: '/api/jobseeker/search/jobsearch',
  JOB_FILTER_DROPDOWNS: '/api/jobseeker/job-alert/getFilterDropDownDetails',
  JOB_ALERTS: '/api/jobseeker/job-alert/jobalerts',
  JOB_DETAILS: '/api/jobseeker/job-alert/getJobDetails',
  APPLY_JOB: '/api/jobseeker/job-alert/apply',
  APPLIED_JOBS: '/api/jobseeker/job-alert/getAppliedJobs',
  TOGGLE_SAVED_JOB: '/api/jobseeker/saved-job/toggleJob',
  SAVED_JOBS: '/api/jobseeker/saved-job/getSavedJobs',

  // Application Lifecycle & Timeline (PDF Item 1, 2, 16)
  APPLICATION_TIMELINE: (id) => `/api/jobseeker/applications/${id}/timeline`,
  APPLICATION_UPDATES: (id) => `/api/jobseeker/applications/${id}/updates`,
  WITHDRAW_APPLICATION: (id) => `/api/jobseeker/applications/${id}/withdraw`,

  // HR Updates (PDF Item 3, 4)
  HR_UPDATES: '/api/jobseeker/hr-updates',
  HR_UPDATE_READ: (updateId) => `/api/jobseeker/hr-updates/${updateId}/read`,

  // Job Alerts CRUD (PDF Item 7, 8, 9, 10)
  JOB_ALERTS_CRUD: '/api/jobseeker/job-alerts',
  JOB_ALERT_ITEM: (alertId) => `/api/jobseeker/job-alerts/${alertId}`,

  // Notifications & Push Tokens (PDF Item 11, 12, 13, 14, 15)
  NOTIFICATIONS: '/api/jobseeker/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/api/jobseeker/notifications/unread-count',
  NOTIFICATIONS_READ_ALL: '/api/jobseeker/notifications/read-all',
  NOTIFICATIONS_READ_ITEM: (id) => `/api/jobseeker/notifications/${id}/read`,
  PUSH_TOKENS: '/api/jobseeker/push-tokens',

  // Standalone Resume Upload & Delete (PDF Item 17, 18)
  RESUME_UPLOAD: '/api/jobseeker/documents/resume',
  RESUME_DELETE: '/api/jobseeker/documents/resume',
  
  // Dashboard & Info
  DASHBOARD: '/api/jobseeker/dashboard',
  STATS: '/api/info/stats',
  POPULAR_VACANCIES: '/api/info/popular-vacancies',
  POPULAR_CATEGORIES: '/api/info/popular-categories',
  RECENT_JOBS: '/api/info/recent-jobs',
  TOP_COMPANIES: '/api/info/top-companies',
  TERMS: '/api/jobseeker/termsAndService/getTermsAndService',
  TERMS_ALT: '/api/jobseeker/termsAndService/getTerms',
  
  // Plans & Payment (PDF Item 5, 6)
  PLANS: '/api/auth/jobseeker/getJobSeekerPlan',
  CREATE_ORDER: '/api/auth/jobseeker/plan/create-order',
  JOBSEEKER_CREATE_ORDER: '/api/auth/jobseeker/plan/create-order',
  VERIFY_PAYMENT: '/api/auth/jobseeker/plan/verify-payment',
  PURCHASE_STATUS: (orderId) => `/api/auth/jobseeker/plan/purchase-status/${orderId}`,
  EMPLOYER_CREATE_ORDER: '/api/employer/plan/create-order',
  RAZORPAY_KEY_ID: (typeof process !== 'undefined' && (process.env?.EXPO_PUBLIC_RAZORPAY_KEY_ID || process.env?.RAZORPAY_KEY_ID)) || 'rzp_test_TlJxZPxz3RYdke',
  RAZORPAY_WEBHOOK: '/api/webhooks/razorpay/jobseeker-plan',

  // Super Admin Revenue & Billing APIs (PDF Part B)
  REVENUE_TRANSACTIONS: '/api/admin/revenue/transactions',
  REVENUE_OVERVIEW: '/api/admin/dashboard/revenue-overview',
  INVOICE_DOWNLOAD: (id) => `/api/admin/employer-billing-transactions/${id}/invoice-download`,
  ADMIN_EMPLOYER_BILLING_TRANSACTIONS: '/api/admin/employer-billing-transactions',
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_REVENUE_ANALYTICS: '/api/admin/dashboard/revenue-analytics',

  // Employer Auth & Recovery
  EMPLOYER_SIGNIN: '/api/employer/user/signin',
  EMPLOYER_SIGNUP: '/api/employer/user/signup',
  EMPLOYER_REQUEST_RESET: '/api/employer/user/requestpasswordreset',
  EMPLOYER_VERIFY_PASS_OTP: '/api/employer/user/verifypassotp',
  EMPLOYER_RESET_PASSWORD: '/api/employer/user/resetpassword',
  EMPLOYER_SEND_EMAIL_OTP: '/api/employer/verify/getemailandsendotp',
  EMPLOYER_VERIFY_EMAIL_OTP: '/api/employer/verify/verifyemail',

  // Employer Profile / Onboarding
  EMPLOYER_CREATE_DETAILS: '/api/employer/combine/createdetail',
  EMPLOYER_GET_DETAILS: '/api/employer/combine/getdetail',
  EMPLOYER_UPDATE_DETAILS: '/api/employer/combine/updatedetail',
  EMPLOYER_CATEGORIES: '/api/employer/category/getallcategory',
  EMPLOYER_SUB_CATEGORIES: (id) => `/api/employer/category/getallsubcategory/${id}`,
  EMPLOYER_DESIGNATIONS: (id) => `/api/employer/category/getdesignation/${id}`,

  // Employer Dashboard
  EMPLOYER_DASHBOARD_STATS: '/api/employer/dashboard/stats',
  EMPLOYER_RECENT_JOBS: '/api/employer/dashboard/recent-jobs',

  // Employer Jobs (My Jobs CRUD & Matches)
  EMPLOYER_MY_JOBS: '/api/job/getjob/byemployer',
  EMPLOYER_ADD_JOB: '/api/job/addjob',
  EMPLOYER_JOB_DETAILS: (id) => `/api/job/jobdetails/${id}`,
  EMPLOYER_UPDATE_JOB: (id) => `/api/job/updatejob/${id}`,
  EMPLOYER_DELETE_JOB: (id) => `/api/job/deletejob/${id}`,
  EMPLOYER_APPLICANTS: (id) => `/api/job/applicants/${id}`,
  EMPLOYER_MATCHES: (id) => `/api/job/matches/${id}`,
  EMPLOYER_APPLICANT_DETAILS: (id) => `/api/job/getApplicantDetails/${id}`,
};

export default API_ENDPOINTS;
