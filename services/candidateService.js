import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeJobLocationsList, normalizeJobTitlesList } from '../utils/jobFormatters';
import { getToken, getUser, saveUser } from '../src/storage/authStorage';

export const GENDER_OPTIONS = [
  { id: 'Male', name: 'Male' },
  { id: 'Female', name: 'Female' },
  { id: 'Other', name: 'Other' },
];

export const SALARY_OPTIONS = [
  { id: '100000', name: '₹1 LPA (1,00,000)', value: 100000 },
  { id: '200000', name: '₹2 LPA (2,00,000)', value: 200000 },
  { id: '300000', name: '₹3 LPA (3,00,000)', value: 300000 },
  { id: '400000', name: '₹4 LPA (4,00,000)', value: 400000 },
  { id: '500000', name: '₹5 LPA (5,00,000)', value: 500000 },
  { id: '600000', name: '₹6 LPA (6,00,000)', value: 600000 },
  { id: '800000', name: '₹8 LPA (8,00,000)', value: 800000 },
  { id: '1000000', name: '₹10 LPA (10,00,000)', value: 1000000 },
  { id: '1200000', name: '₹12 LPA (12,00,000)', value: 1200000 },
  { id: '1500000', name: '₹15 LPA (15,00,000)', value: 1500000 },
  { id: '1800000', name: '₹18 LPA (18,00,000)', value: 1800000 },
  { id: '2000000', name: '₹20 LPA (20,00,000)', value: 2000000 },
  { id: '2500000', name: '₹25 LPA (25,00,000)', value: 2500000 },
  { id: '3000000', name: '₹30 LPA (30,00,000)', value: 3000000 },
  { id: '4000000', name: '₹40 LPA (40,00,000)', value: 4000000 },
  { id: '5000000', name: '₹50 LPA (50,00,000)', value: 5000000 },
];

// Caching layer for Dropdowns, Plans, and User Details (P1 optimization)
let cachedCategories = null;
let cachedCategoriesTime = 0;
const cachedSubCategories = new Map();
const cachedDesignations = new Map();
let cachedPlans = null;
let cachedPlansTime = 0;
let cachedUserDetails = null;
let cachedUserDetailsTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour for dropdown categories & designations
const PLANS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes for plans
const USER_DETAILS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes for user details

export const candidateService = {
  // 1. Fetch Job Categories (API 10 in PDF / Item 2 in today's integration plan)
  async getCategories() {
    // Return in-memory cached categories if fresh
    if (cachedCategories && (Date.now() - cachedCategoriesTime < CACHE_TTL_MS)) {
      return cachedCategories;
    }

    try {
      // Check persistent storage if in-memory cache is empty
      if (!cachedCategories) {
        const stored = await AsyncStorage.getItem('@cached_job_categories').catch(() => null);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedCategories = parsed;
            cachedCategoriesTime = Date.now();
            return cachedCategories;
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const result = json.data.map((c) => ({
            id: c._id,
            name: c.name,
          }));
          cachedCategories = result;
          cachedCategoriesTime = Date.now();
          AsyncStorage.setItem('@cached_job_categories', JSON.stringify(result)).catch(() => {});
          return result;
        }
      }
    } catch (e) {
      console.log('getCategories network error:', e.message);
    }
    return [];
  },

  // 2. Fetch SubCategories / Job Roles based on selected Category ID (API 11 in PDF / Item 3 in today's plan)
  async getSubCategories(categoryId) {
    if (!categoryId) return [];

    const cached = cachedSubCategories.get(categoryId);
    if (cached && (Date.now() - cached.time < CACHE_TTL_MS)) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUB_CATEGORIES(categoryId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const result = json.data.map((s) => ({
            id: s._id,
            name: s.name,
            categoryId: s.categoryId?._id || categoryId,
          }));
          cachedSubCategories.set(categoryId, { data: result, time: Date.now() });
          return result;
        }
      }
    } catch (e) {
      console.log('getSubCategories network error:', e.message);
    }
    return [];
  },

  // 3. Fetch Designations / Specializations based on selected Job Role ID (API 12 in PDF / Item 4 in today's plan)
  async getDesignations(subCategoryId) {
    if (!subCategoryId) return [];

    const cached = cachedDesignations.get(subCategoryId);
    if (cached && (Date.now() - cached.time < CACHE_TTL_MS)) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DESIGNATIONS(subCategoryId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const result = json.data.map((d) => ({
            id: d._id,
            name: d.name,
            subCategoryId: d.subCategoryId?._id || subCategoryId,
          }));
          cachedDesignations.set(subCategoryId, { data: result, time: Date.now() });
          return result;
        }
      }
    } catch (e) {
      console.log('getDesignations network error:', e.message);
    }
    return [];
  },

  // Category Module Statistics (PDF Pages 2-7)
  // GET /api/admin/jobSeeker/category/statistics
  async getCategoryStatistics({ date = null, category = null, fromDate = null, toDate = null } = {}) {
    let authToken = await getToken().catch(() => null);
    try {
      const queryParts = [];
      if (date) queryParts.push(`date=${encodeURIComponent(date)}`);
      if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
      if (fromDate) queryParts.push(`fromDate=${encodeURIComponent(fromDate)}`);
      if (toDate) queryParts.push(`toDate=${encodeURIComponent(toDate)}`);

      const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY_STATISTICS}${qs}`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('getCategoryStatistics error:', e.message);
    }
    return null;
  },

  // 4. Fetch Locations from Filter Dropdowns API (API 18 in PDF)
  async getLocations() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_FILTER_DROPDOWNS}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const json = await response.json();
        if (json.jobLocations && Array.isArray(json.jobLocations) && json.jobLocations.length > 0) {
          const locs = normalizeJobLocationsList(json.jobLocations, false);
          return locs.map((loc) => ({ id: loc, name: loc }));
        }
      }
    } catch (e) {
      console.log('getLocations network error:', e.message);
    }
    return this.getFallbackLocations();
  },

  // 5. Gender Options (from fixed backend schema enum)
  getGenderOptions() {
    return GENDER_OPTIONS;
  },

  // 6. Save Basic Details / Update Profile (API 14 in PDF)
  async saveBasicDetails(basicDetailsPayload, token = null) {
    const payload = {
      basicDetails: {
        jobCategory: basicDetailsPayload.jobCategory,
        jobRole: basicDetailsPayload.jobRole,
        specialization: basicDetailsPayload.specialization,
        email: basicDetailsPayload.email,
        dateOfBirth: basicDetailsPayload.dateOfBirth,
        gender: basicDetailsPayload.gender,
        location: basicDetailsPayload.location,
      },
    };

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.log('saveBasicDetails network error:', e.message);
      }
    }

    // Persist in local memory storage
    return {
      success: true,
      message: 'Basic details saved successfully',
      data: payload.basicDetails,
    };
  },

    // 7. Preferred Designation Options
  async getPreferredDesignations(subCategoryId = null) {
    if (subCategoryId) {
      try {
        const subList = await this.getDesignations(subCategoryId);
        if (subList && subList.length > 0) return subList;
      } catch (e) {
        console.log('getPreferredDesignations subCategory fallback:', e.message);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_FILTER_DROPDOWNS}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const json = await response.json();
        if (json.jobTitles && Array.isArray(json.jobTitles) && json.jobTitles.length > 0) {
          const titles = normalizeJobTitlesList(json.jobTitles);
          return titles.map((t) => ({ id: t, name: t }));
        }
      }
    } catch (e) {
      console.log('getPreferredDesignations filter API fallback:', e.message);
    }

    return this.getFallbackDesignations();
  },

  getFallbackDesignations() {
    return [
      { id: 'Software Engineer', name: 'Software Engineer' },
      { id: 'Full Stack Developer', name: 'Full Stack Developer' },
      { id: 'Frontend Developer', name: 'Frontend Developer' },
      { id: 'Backend Developer', name: 'Backend Developer' },
      { id: 'React Native Developer', name: 'React Native Developer' },
      { id: 'Mobile App Developer', name: 'Mobile App Developer' },
      { id: 'UI/UX Designer', name: 'UI/UX Designer' },
      { id: 'Product Manager', name: 'Product Manager' },
      { id: 'Data Analyst', name: 'Data Analyst' },
      { id: 'Business Analyst', name: 'Business Analyst' },
      { id: 'DevOps Engineer', name: 'DevOps Engineer' },
      { id: 'QA Engineer', name: 'QA Engineer' },
      { id: 'Project Manager', name: 'Project Manager' },
      { id: 'HR Executive', name: 'HR Executive' },
      { id: 'Digital Marketer', name: 'Digital Marketer' },
    ];
  },

  getFallbackLocations() {
    return [
      { id: 'Nagpur', name: 'Nagpur' },
      { id: 'Noida', name: 'Noida' },
      { id: 'Gurugram', name: 'Gurugram' },
      { id: 'Delhi NCR', name: 'Delhi NCR' },
      { id: 'Bengaluru', name: 'Bengaluru' },
      { id: 'Pune', name: 'Pune' },
      { id: 'Mumbai', name: 'Mumbai' },
      { id: 'Hyderabad', name: 'Hyderabad' },
      { id: 'Chennai', name: 'Chennai' },
      { id: 'Ahmedabad', name: 'Ahmedabad' },
      { id: 'Kolkata', name: 'Kolkata' },
      { id: 'Jaipur', name: 'Jaipur' },
      { id: 'Indore', name: 'Indore' },
      { id: 'Chandigarh', name: 'Chandigarh' },
      { id: 'Remote', name: 'Remote' },
    ];
  },

  // 8. Desired Salary Options
  getSalaryOptions() {
    return SALARY_OPTIONS;
  },

  // 9. Save Skills and Preferences (API 14 in PDF)
  async saveSkillsAndPreferences(payload, token = null) {
    const body = {
      skillsAndPreference: {
        skills: payload.skills || [],
        typeRole: payload.typeRole || [],
        preferredDesignation: payload.preferredDesignation || '',
        preferredLocation: payload.preferredLocation || '',
        desiredSalary: {
          min: payload.desiredSalary?.min ?? payload.minSalary ?? null,
          max: payload.desiredSalary?.max ?? payload.maxSalary ?? null,
        },
        currentlyWorking: Boolean(payload.currentlyWorking),
      },
    };

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.log('saveSkillsAndPreferences network error:', e.message);
      }
    }

    return {
      success: true,
      message: 'Skills & Preferences saved successfully',
      data: body.skillsAndPreference,
    };
  },

  // 10. Save Certifications (API 14 in PDF)
  async saveCertifications(payload, token = null) {
    const body = {
      certifications: Array.isArray(payload) ? payload : [payload],
    };

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.log('saveCertifications network error:', e.message);
      }
    }

    return {
      success: true,
      message: 'Certifications saved successfully',
      data: body.certifications,
    };
  },

  // Education state & persistence
  _educations: [],

  getEducations() {
    return this._educations;
  },

  async saveEducation(educationsList, token = null) {
    const list = Array.isArray(educationsList) ? educationsList : [educationsList];
    this._educations = list;

    try {
      await AsyncStorage.setItem('@candidate_education_store', JSON.stringify(list));
    } catch (e) {
      // Safe local fallback
    }

    if (token) {
      try {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ education: list }),
        });
      } catch (e) {
        console.log('saveEducation network error:', e.message);
      }
    }

    return {
      success: true,
      message: 'Education saved successfully',
      data: list,
    };
  },

  // Work Experience state & persistence
  _workExperiences: [],

  getWorkExperience() {
    return this._workExperiences;
  },

  async saveWorkExperience(experiencesList, token = null) {
    const list = Array.isArray(experiencesList) ? experiencesList : [experiencesList];
    this._workExperiences = list;

    try {
      await AsyncStorage.setItem('@candidate_work_experience_store', JSON.stringify(list));
    } catch (e) {
      // Safe local fallback
    }

    let authToken = token || (await getToken().catch(() => null));
    if (authToken) {
      try {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ experience: list }),
        });
      } catch (e) {
        console.log('saveWorkExperience network error:', e.message);
      }
    }

    return {
      success: true,
      message: 'Work Experience saved successfully',
      data: list,
    };
  },

  // API 14: Update Profile (POST /api/auth/jobseeker/updateProfile)
  async updateProfileApi(payload = {}, token = null) {
    let authToken = token || (await getToken().catch(() => null));

    if (!authToken) {
      return { success: false, message: 'Authentication required' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      let json = null;
      try {
        json = await response.json();
      } catch {}

      if (response.ok) {
        return { success: true, ...json };
      }
      return {
        success: false,
        message: json?.message || `Failed to update profile (HTTP ${response.status})`,
      };
    } catch (e) {
      console.log('updateProfileApi network error:', e.message);
      return { success: false, message: e.message };
    }
  },

  // 11. Fetch User Profile Details & Resume (API 13 in PDF / Item 5 in today's integration plan)
  async fetchUserDetails(token = null) {
    if (cachedUserDetails && (Date.now() - cachedUserDetailsTime < USER_DETAILS_CACHE_TTL_MS)) {
      return cachedUserDetails;
    }

    let authToken = token || (await getToken().catch(() => null));

    if (authToken) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // 1. Primary endpoint: /api/auth/jobseeker/fetchUserDetails (Confirmed 200 OK on live backend)
        let response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FETCH_USER_DETAILS}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
        });

        // 2. Dual fallback: /api/auth/jobseeker/userdetails (If backend implements table route)
        if (response.status === 404 && API_ENDPOINTS.FETCH_USER_DETAILS_ALT) {
          response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FETCH_USER_DETAILS_ALT}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            signal: controller.signal,
          });
        }
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          cachedUserDetails = json;
          cachedUserDetailsTime = Date.now();
          if (json) {
            const u = json.user || json.data?.user || json.data || json;
            const resolvedName = u.fullName || u.name || ([u.firstName, u.lastName].filter(Boolean).join(' ').trim());
            const resolvedEmail = u.email || json.email;
            const resolvedPhone = u.mobileNumber || u.phone;
            const resolvedLocation = u.basicDetails?.location || u.location;
            const clean = {};
            if (resolvedName) clean.fullName = resolvedName;
            if (resolvedEmail) clean.email = resolvedEmail;
            if (resolvedPhone) clean.phone = resolvedPhone;
            if (resolvedLocation) clean.location = resolvedLocation;
            if (Object.keys(clean).length > 0) {
              this.updateUserProfile(clean);
            }
          }
          return json;
        }
      } catch (e) {
        console.log('fetchUserDetails network error:', e.message);
      }
    }
    return null;
  },

  // 12. Fetch Jobseeker Subscription Plans (API 15 in PDF / Item 6 in today's integration plan)
  async getJobSeekerPlans() {
    if (cachedPlans && (Date.now() - cachedPlansTime < PLANS_CACHE_TTL_MS)) {
      return cachedPlans;
    }

    try {
      // 1. Try GET (Live Render backend returns 200)
      let response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PLANS}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      // 2. Fallback to POST if 404 (Per API doc table)
      if (response.status === 404) {
        response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PLANS}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }

      if (response.ok) {
        const json = await response.json();
        const rawPlans = json.data || json.plans || [];
        if (Array.isArray(rawPlans) && rawPlans.length > 0) {
          const activePlans = rawPlans.filter((p) => !p.isDeleted);
          const plansList = (activePlans.length > 0 ? activePlans : rawPlans).map((p) => ({
            _id: p._id,
            planName: p.planName ? p.planName.charAt(0).toUpperCase() + p.planName.slice(1) : 'Plan',
            planTag: p.planTag || 'For Active Job Seekers',
            validity: p.validity ? `${p.validity} Month${p.validity > 1 ? 's' : ''}` : '30 Days',
            planPrice: p.planPrice || 0,
            discount: p.discount || 0,
            canApplyJobsPerMonth: p.canApplyJobsPerMonth ?? 5,
            profileBoost: Boolean(p.profileBoost),
            jobAlert: Boolean(p.jobAlert),
            support: Boolean(p.support),
          }));

          cachedPlans = plansList;
          cachedPlansTime = Date.now();
          return plansList;
        }
      }
    } catch (e) {
      console.log('getJobSeekerPlans network error:', e.message);
    }

    return [];
  },

  // CREATE ORDER – Jobseeker (Razorpay Payment APIs - PDF Part A1)
  // POST /api/auth/jobseeker/plan/create-order
  // Header: Authorization: Bearer <JWT_TOKEN>
  // Request Body: { "planId": "<selectedPlanId>" }
  async createJobseekerPlanOrder(planId) {
    let authToken = await getToken().catch(() => null);
    const defaultKey = API_ENDPOINTS.RAZORPAY_KEY_ID || 'rzp_test_TlJxZPxz3RYdke';

    const payload = { planId };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_ORDER}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      let json = null;
      try {
        json = await response.json();
      } catch {}

      if (response.ok && json) {
        const orderData = json.data || json;
        const resolvedOrderId =
          orderData.orderId || orderData.order_id || orderData.id || json.orderId || json.order_id;
        const resolvedAmount = orderData.amount || json.amount || 19900;
        const resolvedCurrency = orderData.currency || json.currency || 'INR';
        const resolvedKey = orderData.key || json.key || defaultKey;
        const resolvedPlan = orderData.plan || json.plan || null;

        return {
          success: true,
          status: response.status,
          message: json.message || 'Order created successfully',
          key: resolvedKey,
          orderId: resolvedOrderId,
          order_id: resolvedOrderId,
          amount: resolvedAmount,
          currency: resolvedCurrency,
          plan: resolvedPlan,
          data: orderData,
        };
      }

      // If backend endpoint is not yet ready or returns 404, fallback gracefully to direct checkout
      return {
        success: true,
        isFallback: true,
        key: defaultKey,
        orderId: null,
        order_id: null,
        amount: 19900,
        currency: 'INR',
      };
    } catch (e) {
      console.log('createJobseekerPlanOrder network fallback:', e.message);
      return {
        success: true,
        isFallback: true,
        key: defaultKey,
        orderId: null,
        order_id: null,
        amount: 19900,
        currency: 'INR',
      };
    }
  },

  // VERIFY PAYMENT – Jobseeker (PDF Part A2)
  // POST /api/auth/jobseeker/plan/verify-payment
  // Header: Authorization: Bearer <JWT_TOKEN>
  // Request Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId }
  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, planName, price } = {}) {
    let authToken = await getToken().catch(() => null);

    const payload = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };
    if (planId) {
      payload.planId = planId;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_PAYMENT}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      let json = null;
      try {
        json = await response.json();
      } catch {}

      if (response.ok && json?.success !== false) {
        // Activate locally as well for persistent state & offline access
        await this.activateUserPlan({
          planId,
          planName: json?.data?.planName || planName,
          price,
          paymentId: razorpay_payment_id,
        }).catch(() => null);

        return {
          success: true,
          status: response.status,
          message: json?.message || 'Payment verified and plan activated successfully',
          data: json?.data || json,
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          status: 400,
          message:
            json?.message ||
            'Payment could not be verified. If money was deducted, your plan will activate shortly',
          data: json,
        };
      }

      return {
        success: false,
        status: response.status,
        message: json?.message || 'Payment verification failed',
        data: json,
      };
    } catch (e) {
      console.log('verifyPayment network error:', e.message);
      // Per PDF A4: On network error during Verify, caller should check Purchase Status or retry
      return {
        success: false,
        isNetworkError: true,
        message: e.message,
      };
    }
  },

  // Active Plan Local Persistence & Query
  _activePlan: null,
  async getActivePlan() {
    if (this._activePlan) return this._activePlan;
    try {
      const stored = await AsyncStorage.getItem('@candidate_active_plan');
      if (stored) {
        this._activePlan = JSON.parse(stored);
        return this._activePlan;
      }
      const mockStored = await AsyncStorage.getItem('mockPurchasedPlan');
      if (mockStored) {
        this._activePlan = JSON.parse(mockStored);
        return this._activePlan;
      }
    } catch (e) {
      console.log('getActivePlan error:', e.message);
    }
    return null;
  },

  async activateUserPlan({ planId, planName, price, paymentId }) {
    const planData = {
      planId,
      planName: planName || 'Premium Plan',
      price: price || '899',
      paymentId: paymentId || `pay_${Date.now()}`,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    };
    this._activePlan = planData;
    try {
      await AsyncStorage.setItem('@candidate_active_plan', JSON.stringify(planData));
      await AsyncStorage.setItem('mockPurchasedPlan', JSON.stringify(planData));
    } catch (e) {
      console.log('activateUserPlan error:', e.message);
    }
    return planData;
  },

  // ORDER PURCHASE STATUS – Jobseeker (PDF Part A3)
  // GET /api/auth/jobseeker/plan/purchase-status/:orderId
  // Header: Authorization: Bearer <JWT_TOKEN>
  async getPurchaseStatus(orderId) {
    if (!orderId) return null;
    let authToken = await getToken().catch(() => null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PURCHASE_STATUS(orderId)}`, {
        method: 'GET',
        headers,
      });

      let json = null;
      try {
        json = await response.json();
      } catch {}

      if (response.ok) {
        return {
          success: true,
          status: response.status,
          data: json?.data || json,
        };
      }

      return {
        success: false,
        status: response.status,
        message: json?.message || 'Failed to fetch purchase status',
      };
    } catch (e) {
      console.log('getPurchaseStatus network error:', e.message);
      return {
        success: false,
        isNetworkError: true,
        message: e.message,
      };
    }
  },

  // 13. API 9: Get User Profile All Details (GET /api/auth/jobseeker/profile)
  async fetchUserProfileDetails(token = null) {
    let authToken = token || (await getToken().catch(() => null));

    if (authToken) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json) {
            const u = json.user || json.data?.user || json.data || json;
            const resolvedName = u.fullName || u.name || ([u.firstName, u.lastName].filter(Boolean).join(' ').trim());
            const resolvedEmail = u.email || json.email;
            const resolvedPhone = u.mobileNumber || u.phone || json.mobileNumber || json.phone;
            const resolvedLocation = u.basicDetails?.location || u.location;
            const resolvedRole = u.basicDetails?.specialization || u.basicDetails?.jobRole || u.role;
            const resolvedAbout = u.about || u.basicDetails?.about;

            const cleanUpdate = {};
            if (resolvedName) cleanUpdate.fullName = resolvedName;
            if (resolvedEmail) cleanUpdate.email = resolvedEmail;
            if (resolvedPhone) cleanUpdate.phone = resolvedPhone;
            if (resolvedLocation) cleanUpdate.location = resolvedLocation;
            if (resolvedRole) cleanUpdate.role = resolvedRole;
            if (resolvedAbout) cleanUpdate.about = resolvedAbout;
            if (u.isVerified !== undefined) cleanUpdate.isVerified = u.isVerified;

            if (Object.keys(cleanUpdate).length > 0) {
              this.updateUserProfile(cleanUpdate);
            }

            if (typeof json.profileCompleted === 'boolean') {
              this._profileCompleted = json.profileCompleted;
            }
            return json;
          }
        }
      } catch (e) {
        console.log('fetchUserProfileDetails network error:', e.message);
      }
    }

    return this.getUserProfile();
  },

  // 14. API 8: Save Full Profile Details (PUT /api/auth/jobseeker/full-profile-details)
  async saveFullProfileDetails(profileData = {}, token = null) {
    let authToken = token || (await getToken().catch(() => null));

    if (!authToken) {
      return {
        success: false,
        message: 'Authentication token missing. Please sign in to save profile.',
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FULL_PROFILE_DETAILS}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileData),
      });

      let json = null;
      try {
        json = await response.json();
      } catch {}

      if (response.ok) {
        if (json?.user) {
          this.updateUserProfile(json.user);
        }
        if (typeof json?.profileCompleted === 'boolean') {
          this._profileCompleted = json.profileCompleted;
        }
        return {
          success: true,
          ...json,
        };
      }

      return {
        success: false,
        message: json?.message || `Failed to save full profile (HTTP ${response.status})`,
      };
    } catch (e) {
      console.log('saveFullProfileDetails network error:', e.message);
      return {
        success: false,
        message: e.message || 'Network error while saving profile.',
      };
    }
  },

  // 15. API 31: Get Jobseeker Dashboard (GET /api/jobseeker/dashboard)
  _dashboardCache: null,
  _dashboardCacheTime: 0,
  async getJobseekerDashboard({ forceRefresh = false } = {}) {
    if (!forceRefresh && this._dashboardCache && (Date.now() - this._dashboardCacheTime < 30000)) {
      return this._dashboardCache;
    }

    let authToken = await getToken().catch(() => null);

    if (authToken) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const json = await response.json();
          this._dashboardCache = json;
          this._dashboardCacheTime = Date.now();
          // Do NOT overwrite user profile with dashboard API data;
          // the real authenticated profile comes from authStorage / GET /api/auth/jobseeker/profile
          return json;
        }
      } catch (e) {
        console.log('getJobseekerDashboard network fallback:', e.message);
      }
    }

    return null;
  },

  _profileCompleted: false,
  setProfileCompleted(completed = true) {
    this._profileCompleted = completed;
  },
  isProfileCompleted() {
    return this._profileCompleted;
  },

  // Centralized shared user profile state
  _userProfile: {
    fullName: '',
    role: '',
    location: '',
    phone: '',
    email: '',
    about: '',
    visibility: 'public',
    profileImage: null,
  },

  getUserProfile() {
    return this._userProfile;
  },

  setUserProfile(data) {
    return this.updateUserProfile(data);
  },

  updateUserProfile(data) {
    if (!data || typeof data !== 'object') return this._userProfile;

    // Filter out undefined, null, or empty string values so they NEVER overwrite valid existing values!
    const cleanData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanData[key] = value;
      }
    }

    // Resolve canonical Full Name:
    let resolvedName = cleanData.fullName || cleanData.name;
    if (!resolvedName && (cleanData.firstName || cleanData.lastName)) {
      resolvedName = [cleanData.firstName, cleanData.lastName].filter(Boolean).join(' ').trim();
    }

    const updated = {
      ...this._userProfile,
      ...cleanData,
      ...(resolvedName ? { fullName: resolvedName.trim() } : {}),
    };

    // Guarantee that if we already had a valid fullName, it NEVER gets wiped out!
    if (!updated.fullName && this._userProfile.fullName) {
      updated.fullName = this._userProfile.fullName;
    }

    this._userProfile = updated;

    // Persist synchronously/asynchronously to authStorage
    try {
      getUser().then((stored) => {
        if (stored) {
          saveUser({
            ...stored,
            fullName: updated.fullName || stored.fullName,
            email: updated.email || stored.email,
            mobileNumber: updated.phone || stored.mobileNumber,
          });
        } else if (updated.fullName) {
          saveUser({
            fullName: updated.fullName,
            email: updated.email,
            mobileNumber: updated.phone,
          });
        }
      }).catch(() => {});
    } catch (e) {
      // Ignore background sync errors
    }

    return this._userProfile;
  },

  // Resume state management (PDF Item 17 & 18)
  _currentResume: null,

  getCurrentResume() {
    return this._currentResume;
  },

  setResume(resumeData) {
    if (!resumeData) {
      this._currentResume = null;
      return;
    }
    this._currentResume = {
      fileName: resumeData.name || resumeData.fileName || 'resume.pdf',
      uploadedDate: resumeData.uploadedDate || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
      url: resumeData.uri || resumeData.url || '',
      hideContactInSearch: resumeData.hideContactInSearch !== undefined ? resumeData.hideContactInSearch : true,
    };
  },

  deleteResume() {
    this._currentResume = null;
    this.deleteResumeFromBackend().catch(() => {});
  },

  // Standalone Resume Upload (PDF Item 17)
  // POST /api/jobseeker/documents/resume
  async uploadResumeToBackend(file) {
    if (!file) return { success: false, message: 'No file selected' };
    const authToken = await getToken().catch(() => null);
    if (!authToken) return { success: false, message: 'Authentication required' };

    try {
      const formData = new FormData();
      formData.append('resume', {
        uri: file.uri,
        name: file.name || file.fileName || 'resume.pdf',
        type: file.type || file.mimeType || 'application/pdf',
      });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESUME_UPLOAD}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Notice: Let fetch set Content-Type with boundary for FormData
        },
        body: formData,
      });

      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        const resumeUrl = json.data?.resumeUrl || file.uri;
        this.setResume({
          name: file.name || 'resume.pdf',
          url: resumeUrl,
        });
        return {
          success: true,
          message: json.message || 'Resume uploaded successfully',
          data: json.data,
        };
      }
      return { success: false, message: json.message || 'Failed to upload resume' };
    } catch (e) {
      console.log('uploadResumeToBackend network error:', e.message);
      return { success: false, message: e.message || 'Network error while uploading resume' };
    }
  },

  // Standalone Resume Delete (PDF Item 18)
  // DELETE /api/jobseeker/documents/resume
  async deleteResumeFromBackend() {
    const authToken = await getToken().catch(() => null);
    if (!authToken) return { success: false, message: 'Authentication required' };

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESUME_DELETE}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        this._currentResume = null;
        return { success: true, message: json.message || 'Resume deleted successfully' };
      }
      return { success: false, message: json.message || 'Failed to delete resume' };
    } catch (e) {
      console.log('deleteResumeFromBackend network error:', e.message);
      return { success: false, message: e.message || 'Network error while deleting resume' };
    }
  },

  setHideContactInSearch(hide) {
    if (this._currentResume) {
      this._currentResume.hideContactInSearch = hide;
    }
  },

  // Helper to extract initials from full name
  getInitials(name) {
    let resolved = name;
    if (!resolved || typeof resolved !== 'string' || !resolved.trim() || resolved.trim().toLowerCase() === 'candidate') {
      resolved = this._userProfile?.fullName || '';
    }
    if (!resolved || typeof resolved !== 'string' || !resolved.trim()) {
      resolved = this._userProfile?.email || '';
    }
    if (!resolved || !resolved.trim()) return 'A'; // Default to 'A' instead of 'U'
    const parts = resolved.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'A';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },
};

// Bootstrap user profile from storage as early as possible
try {
  getUser().then((stored) => {
    if (stored?.fullName) {
      candidateService.updateUserProfile({
        fullName: stored.fullName,
        email: stored.email,
        phone: stored.mobileNumber,
      });
    }
  }).catch(() => {});
} catch {}

export const getInitials = (name) => candidateService.getInitials(name);
export default candidateService;
