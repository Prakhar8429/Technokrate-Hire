import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

let statsCache = null;
let statsCacheTime = 0;

let vacanciesCache = null;
let vacanciesCacheTime = 0;

let categoriesCache = null;
let categoriesCacheTime = 0;

let recentJobsCache = new Map();
let topCompaniesCache = null;
let topCompaniesCacheTime = 0;

let termsCache = null;
let termsCacheTime = 0;

export const infoService = {
  // API 26: Get Stats - Landing Page (GET /api/info/stats)
  async getStats({ forceRefresh = false } = {}) {
    if (!forceRefresh && statsCache && (Date.now() - statsCacheTime < CACHE_TTL_MS)) {
      return statsCache;
    }

    try {
      const response = await fetch(API_BASE_URL + API_ENDPOINTS.STATS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          statsCache = json.data;
          statsCacheTime = Date.now();
          return json.data;
        }
      }
    } catch (e) {
      console.log('infoService.getStats network error:', e.message);
    }

    return statsCache || null;
  },

  // API 27: Get Popular Vacancies - Landing Page (GET /api/info/popular-vacancies)
  async getPopularVacancies({ forceRefresh = false } = {}) {
    if (!forceRefresh && vacanciesCache && (Date.now() - vacanciesCacheTime < CACHE_TTL_MS)) {
      return vacanciesCache;
    }

    try {
      const response = await fetch(API_BASE_URL + API_ENDPOINTS.POPULAR_VACANCIES, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          vacanciesCache = json.data;
          vacanciesCacheTime = Date.now();
          return json.data;
        }
      }
    } catch (e) {
      console.log('infoService.getPopularVacancies network error:', e.message);
    }

    return vacanciesCache || [];
  },

  // API 28: Get Popular Categories - Landing Page (GET /api/info/popular-categories)
  async getPopularCategories({ forceRefresh = false } = {}) {
    if (!forceRefresh && categoriesCache && (Date.now() - categoriesCacheTime < CACHE_TTL_MS)) {
      return categoriesCache;
    }

    try {
      const response = await fetch(API_BASE_URL + API_ENDPOINTS.POPULAR_CATEGORIES, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          categoriesCache = json.data;
          categoriesCacheTime = Date.now();
          return json.data;
        }
      }
    } catch (e) {
      console.log('infoService.getPopularCategories network error:', e.message);
    }

    return categoriesCache || [];
  },

  // API 29: Get Recent Jobs - Landing Page (GET /api/info/recent-jobs?page=1&limit=6)
  async getRecentJobs({ page = 1, limit = 6, forceRefresh = false } = {}) {
    const cacheKey = page + '_' + limit;
    const cached = recentJobsCache.get(cacheKey);
    if (!forceRefresh && cached && (Date.now() - cached.time < CACHE_TTL_MS)) {
      return cached.data;
    }

    try {
      const response = await fetch(API_BASE_URL + API_ENDPOINTS.RECENT_JOBS + '?page=' + page + '&limit=' + limit, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          recentJobsCache.set(cacheKey, { data: json, time: Date.now() });
          return json;
        }
      }
    } catch (e) {
      console.log('infoService.getRecentJobs network error:', e.message);
    }

    return cached?.data || { data: [], pagination: { currentPage: page, limit, totalJobs: 0 } };
  },

  // API 30: Get Top Companies - Landing Page (GET /api/info/top-companies)
  async getTopCompanies({ forceRefresh = false } = {}) {
    if (!forceRefresh && topCompaniesCache && (Date.now() - topCompaniesCacheTime < CACHE_TTL_MS)) {
      return topCompaniesCache;
    }

    try {
      const response = await fetch(API_BASE_URL + API_ENDPOINTS.TOP_COMPANIES, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          topCompaniesCache = json.data;
          topCompaniesCacheTime = Date.now();
          return json.data;
        }
      }
    } catch (e) {
      console.log('infoService.getTopCompanies network error:', e.message);
    }

    return topCompaniesCache || [];
  },

  // API 32: Jobseeker Terms & Services (GET /api/jobseeker/termsAndService/getTerms)
  async getTermsAndService({ forceRefresh = false } = {}) {
    if (!forceRefresh && termsCache && (Date.now() - termsCacheTime < 300 * 1000)) {
      return termsCache;
    }

    // Try primary route from PRD, fallback to deployed plural route
    const endpoints = [
      API_ENDPOINTS.TERMS_ALT || '/api/jobseeker/termsAndService/getTerms',
      API_ENDPOINTS.TERMS || '/api/jobseeker/termsAndService/getTermsAndService',
    ];

    for (const ep of endpoints) {
      try {
        const response = await fetch(API_BASE_URL + ep, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const json = await response.json();
          const data = json.data || json;
          if (data && (data.content || data.title)) {
            termsCache = data;
            termsCacheTime = Date.now();
            return data;
          }
        }
      } catch (e) {
        console.log(`infoService.getTermsAndService [${ep}] network error:`, e.message);
      }
    }

    return termsCache || null;
  },
};

export default infoService;
