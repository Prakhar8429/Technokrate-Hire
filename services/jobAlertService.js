import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from '../src/storage/authStorage';

const STORAGE_KEYS = {
  FILTERS: '@technokrate_alert_filters_v2',
  ALERTS: '@technokrate_active_alerts_v2',
  HISTORY: '@technokrate_history_alerts_v2',
};

const DEFAULT_FILTERS = {
  jobTypes: [], // ['Full Time', 'Part Time', 'Internship', 'Freelance']
  designation: '',
  location: '',
  salaryMin: null,
  salaryMax: null,
};

export const AVAILABLE_JOB_TYPES = [
  'Full Time',
  'Part Time',
  'Internship',
  'Freelance',
];

export const SALARY_DROPDOWN_OPTIONS = [
  { label: 'Any', value: null },
  { label: '$30,000', value: 30000 },
  { label: '$50,000', value: 50000 },
  { label: '$80,000', value: 80000 },
  { label: '$100,000', value: 100000 },
  { label: '$120,000', value: 120000 },
  { label: '$150,000', value: 150000 },
  { label: '$200,000+', value: 200000 },
];

class JobAlertService {
  constructor() {
    this._cachedFilters = null;
    this._cachedAlerts = null;
    this._cachedAlertsTime = 0;
    this._cachedHistory = null;
    this._cachedHistoryTime = 0;
    this._cachedOptions = null;
  }

  // 1. Get current filters (persisted)
  async getFilters() {
    if (this._cachedFilters) return { ...this._cachedFilters };
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this._cachedFilters = this._sanitizeFilters(parsed);
        return { ...this._cachedFilters };
      }
    } catch (e) {
      // Graceful fallback to memory
    }
    this._cachedFilters = { ...DEFAULT_FILTERS };
    return { ...this._cachedFilters };
  }

  // Helper to ensure filters always have valid, predictable types
  _sanitizeFilters(filters) {
    if (!filters || typeof filters !== 'object') {
      return { ...DEFAULT_FILTERS };
    }

    const rawJobTypes = Array.isArray(filters.jobTypes)
      ? filters.jobTypes
      : typeof filters.jobTypes === 'string'
      ? [filters.jobTypes]
      : [];

    const cleanJobTypes = Array.from(
      new Set(
        rawJobTypes
          .map((t) => (typeof t === 'string' ? t : t?.name || t?.label || t?.value || ''))
          .map((t) => String(t).trim())
          .filter(Boolean)
      )
    );

    const cleanDesignation =
      typeof filters.designation === 'string'
        ? filters.designation.trim()
        : filters.designation?.name
        ? String(filters.designation.name).trim()
        : '';

    const cleanLocation =
      typeof filters.location === 'string'
        ? filters.location.trim()
        : filters.location?.name
        ? String(filters.location.name).trim()
        : '';

    const cleanSalaryMin =
      filters.salaryMin !== null && filters.salaryMin !== undefined && !isNaN(Number(filters.salaryMin))
        ? Number(filters.salaryMin)
        : null;

    const cleanSalaryMax =
      filters.salaryMax !== null && filters.salaryMax !== undefined && !isNaN(Number(filters.salaryMax))
        ? Number(filters.salaryMax)
        : null;

    return {
      jobTypes: cleanJobTypes,
      designation: cleanDesignation,
      location: cleanLocation,
      salaryMin: cleanSalaryMin,
      salaryMax: cleanSalaryMax,
    };
  }

  // 2. Save current filters
  async saveFilters(filters) {
    this._cachedFilters = this._sanitizeFilters({ ...DEFAULT_FILTERS, ...filters });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FILTERS,
        JSON.stringify(this._cachedFilters)
      );
    } catch (e) {
      // Graceful fallback to memory
    }
    return { ...this._cachedFilters };
  }

  // 3. Clear/Reset filters
  async resetFilters() {
    this._cachedFilters = { ...DEFAULT_FILTERS };
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FILTERS);
    } catch (e) {
      // Graceful fallback to memory
    }
    return { ...this._cachedFilters };
  }

  async _resolveToken() {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }

  // 4. Fetch Candidate Job Alerts from live backend (PDF Item 8)
  // GET /api/jobseeker/job-alerts
  async fetchAlertsFromBackend() {
    const token = await this._resolveToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_ALERTS_CRUD}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        const list = json.data || [];
        if (Array.isArray(list)) {
          const mapped = list.map((item) => ({
            id: item._id,
            title: item.role || item.keyword || 'Job Alert',
            subtitle: `${item.workMode || 'Full Time'} • ${item.location || 'Anywhere'}`,
            jobType: item.workMode || 'Full Time',
            designation: item.role || '',
            location: item.location || '',
            salaryMin: item.salaryMin || 0,
            salaryMax: null,
            salaryFormatted: item.salaryMin ? `₹${(item.salaryMin / 100000).toFixed(1)} LPA+` : 'Best in Industry',
            enabled: Boolean(item.isActive),
            status: item.isActive ? 'Active' : 'Paused',
            frequency: item.frequency || 'daily',
            matchesText: item.isActive ? `Checking ${item.frequency || 'daily'} matches` : 'Alert paused',
            createdAt: item.createdAt,
          }));

          const active = mapped.filter((a) => a.enabled);
          const history = mapped.filter((a) => !a.enabled);
          this._cachedAlerts = active;
          this._cachedAlertsTime = Date.now();
          this._cachedHistory = history;
          this._cachedHistoryTime = Date.now();

          await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(active)).catch(() => {});
          await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)).catch(() => {});
          return { active, history };
        }
      }
    } catch (e) {
      console.log('fetchAlertsFromBackend network error:', e.message);
    }
    return null;
  }

  // Create Job Alert on backend (PDF Item 7)
  // POST /api/jobseeker/job-alerts
  async createAlert(alertData) {
    const token = await this._resolveToken();
    if (!token) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_ALERTS_CRUD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(alertData),
      });

      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        this._cachedAlerts = null;
        this._cachedHistory = null;
        await this.fetchAlertsFromBackend();
        return { success: true, data: json.data, message: json.message };
      }
      return { success: false, message: json.message || 'Failed to create job alert' };
    } catch (e) {
      console.log('createAlert error:', e.message);
      return { success: false, message: e.message };
    }
  }

  // Update Job Alert on backend (PDF Item 9)
  // PATCH /api/jobseeker/job-alerts/:alertId
  async updateAlertOnBackend(alertId, alertData) {
    if (!alertId) return { success: false };
    const token = await this._resolveToken();
    if (!token) return { success: false };

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_ALERT_ITEM(alertId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(alertData),
      });

      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        return { success: true, data: json.data };
      }
    } catch (e) {
      console.log('updateAlertOnBackend error:', e.message);
    }
    return { success: false };
  }

  // Delete Job Alert on backend (PDF Item 10)
  // DELETE /api/jobseeker/job-alerts/:alertId
  async deleteAlert(alertId) {
    if (!alertId) return { success: false };
    if (this._cachedAlerts) this._cachedAlerts = this._cachedAlerts.filter((a) => a.id !== alertId);
    if (this._cachedHistory) this._cachedHistory = this._cachedHistory.filter((a) => a.id !== alertId);

    const token = await this._resolveToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_ALERT_ITEM(alertId)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json().catch(() => ({}));
        if (response.ok) {
          return { success: true, data: json.data };
        }
      } catch (e) {
        console.log('deleteAlert error:', e.message);
      }
    }
    return { success: true };
  }

  // Load Active Alerts
  async getActiveAlerts(forceRefresh = false) {
    if (!forceRefresh && this._cachedAlerts && (Date.now() - this._cachedAlertsTime < 30000)) {
      return [...this._cachedAlerts];
    }
    const backendResult = await this.fetchAlertsFromBackend();
    if (backendResult) return backendResult.active;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._cachedAlerts = parsed;
          this._cachedAlertsTime = Date.now();
          return [...this._cachedAlerts];
        }
      }
    } catch (e) {}

    this._cachedAlerts = [];
    this._cachedAlertsTime = Date.now();
    return [];
  }

  // Load Alert History
  async getAlertHistory(forceRefresh = false) {
    if (!forceRefresh && this._cachedHistory && (Date.now() - this._cachedHistoryTime < 30000)) {
      return [...this._cachedHistory];
    }
    const backendResult = await this.fetchAlertsFromBackend();
    if (backendResult) return backendResult.history;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._cachedHistory = parsed;
          this._cachedHistoryTime = Date.now();
          return [...this._cachedHistory];
        }
      }
    } catch (e) {}

    this._cachedHistory = [];
    this._cachedHistoryTime = Date.now();
    return [];
  }

  // Toggle Alert (Active <-> History or pause/resume with backend sync)
  async toggleAlert(alertId) {
    const active = await this.getActiveAlerts();
    const history = await this.getAlertHistory();

    const activeIndex = active.findIndex((a) => a.id === alertId);
    if (activeIndex !== -1) {
      // Pause alert -> move to history
      const item = active[activeIndex];
      const pausedItem = {
        ...item,
        enabled: false,
        status: 'Paused',
        pausedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        matchesText: `Alert paused on ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
      };
      const newActive = active.filter((a) => a.id !== alertId);
      const newHistory = [pausedItem, ...history.filter((h) => h.id !== alertId)];

      this._cachedAlerts = newActive;
      this._cachedHistory = newHistory;
      await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(newActive)).catch(() => {});
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory)).catch(() => {});

      // Sync with backend asynchronously
      this.updateAlertOnBackend(alertId, { isActive: false });
      return { active: newActive, history: newHistory };
    }

    const historyIndex = history.findIndex((h) => h.id === alertId);
    if (historyIndex !== -1) {
      // Reactivate alert -> move to active
      const item = history[historyIndex];
      const reactivatedItem = {
        ...item,
        enabled: true,
        status: 'Active',
        matchesText: 'Reactivated • Checking new jobs',
      };
      const newHistory = history.filter((h) => h.id !== alertId);
      const newActive = [reactivatedItem, ...active.filter((a) => a.id !== alertId)];

      this._cachedAlerts = newActive;
      this._cachedHistory = newHistory;
      await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(newActive)).catch(() => {});
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory)).catch(() => {});

      // Sync with backend asynchronously
      this.updateAlertOnBackend(alertId, { isActive: true });
      return { active: newActive, history: newHistory };
    }

    return { active, history };
  }

  // 7. Filter Alerts based on applied filters (Completely crash-proof)
  filterAlerts(alertsList, filters) {
    if (!Array.isArray(alertsList)) return [];
    if (!filters || typeof filters !== 'object') return alertsList;

    try {
      const sanitized = this._sanitizeFilters(filters);
      const { jobTypes, designation, location, salaryMin, salaryMax } = sanitized;

      // Prepare normalized jobTypes for matching
      const normJobTypes = jobTypes.map((t) =>
        t.toLowerCase().replace(/[-_\s]+/g, ' ').trim()
      );

      const normDesig = designation.toLowerCase().trim();
      const normLoc = location.toLowerCase().trim();
      const cleanLocSearch = normLoc.split(',')[0].trim();

      return alertsList.filter((item) => {
        if (!item || typeof item !== 'object') return false;

        // 1. Job Type filter (multi-select matching)
        if (normJobTypes.length > 0) {
          const rawItemType = String(item.jobType || item.subtitle || item.tags || '')
            .toLowerCase()
            .replace(/[-_\s]+/g, ' ')
            .trim();

          const matchesType = normJobTypes.some((jt) => {
            if (!jt) return false;
            if (jt === 'all') return true;
            return rawItemType.includes(jt) || jt.includes(rawItemType);
          });

          if (!matchesType) return false;
        }

        // 2. Designation filter
        if (normDesig && normDesig !== 'all') {
          const itemTitle = String(item.title || item.designation || '')
            .toLowerCase()
            .trim();
          if (!itemTitle.includes(normDesig) && !normDesig.includes(itemTitle)) {
            return false;
          }
        }

        // 3. Location filter
        if (normLoc && normLoc !== 'all') {
          const itemLoc = String(item.location || item.subtitle || '')
            .toLowerCase()
            .trim();
          if (
            !itemLoc.includes(cleanLocSearch) &&
            !itemLoc.includes(normLoc) &&
            !normLoc.includes(itemLoc)
          ) {
            return false;
          }
        }

        // 4. Salary Range filter
        const itemMin = Number(item.salaryMin) || 0;
        const itemMax = Number(item.salaryMax) || itemMin || 999999;

        if (salaryMin !== null && salaryMin > 0) {
          if (itemMax < salaryMin) return false;
        }
        if (salaryMax !== null && salaryMax > 0) {
          if (itemMin > salaryMax) return false;
        }

        return true;
      });
    } catch (e) {
      console.warn('JobAlertService.filterAlerts encountered an issue, returning unfiltered:', e);
      return alertsList;
    }
  }

  // 8. Fetch filter options (designations and locations) safely from API or fallback
  async getFilterDropdownOptions() {
    if (this._cachedOptions) return this._cachedOptions;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.JOB_FILTER_DROPDOWNS}`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        // Safely extract string titles
        const rawTitles = Array.isArray(data?.jobTitles) ? data.jobTitles : [];
        const designationsList = Array.from(
          new Set(
            rawTitles
              .map((t) => (typeof t === 'string' ? t : t?.name || t?.title || ''))
              .map((t) => String(t).trim())
              .filter(Boolean)
          )
        ).sort();

        // Safely extract string locations (backend returns objects { name, isoCode, ... })
        const rawLocs = Array.isArray(data?.jobLocations) ? data.jobLocations : [];
        const locationsList = Array.from(
          new Set(
            rawLocs
              .map((l) => (typeof l === 'string' ? l : l?.name || l?.city || l?.state || ''))
              .map((l) => String(l).trim())
              .filter((l) => Boolean(l) && l.toLowerCase() !== 'all')
          )
        ).sort();

        this._cachedOptions = {
          designations: designationsList,
          locations: locationsList,
        };
        return this._cachedOptions;
      }
    } catch (e) {
      console.log('Error fetching filter dropdown options:', e.message);
    }

    this._cachedOptions = {
      designations: [],
      locations: [],
    };
    return this._cachedOptions;
  }
}

export const jobAlertService = new JobAlertService();
export default jobAlertService;
