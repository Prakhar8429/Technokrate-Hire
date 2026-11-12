import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_STORAGE_KEY = 'user_profile_preferences';

const DEFAULT_PREFERENCES = {
  jobTitles: ['Java Programmer', 'React.JS Developer', 'Node.js Developer'],
  workSchedule: {
    days: ['Weekend only', 'Monday to Friday'],
    shifts: ['Overnight shift', 'Morning shift', 'Day shift'],
  },
  jobTypes: ['Full-time', 'Permanent', 'Contractual / Temporary'],
  minimumPay: {
    amount: 80000,
    period: 'year', // 'hour' | 'day' | 'week' | 'month' | 'year'
  },
  remotePreference: 'all', // 'all' | 'onsite_hybrid' | 'remote'
  commute: {
    location: 'Noida, Uttar Pradesh',
    maxMinutes: 35, // null | 15 | 25 | 35 | 45 | 60 | 90
  },
  relocation: {
    locations: ['Noida, Uttar Pradesh', 'Bengaluru, Karnataka', 'Delhi, Delhi'],
    openToAnywhere: false,
  },
  availability: 'immediately', // 'immediately' | 'within_2_weeks' | 'within_1_month' | 'more_than_1_month'
};

// In-memory cache for synchronous instant rendering
let memoryPreferences = { ...DEFAULT_PREFERENCES };
let isInitialized = false;

class PreferenceService {
  constructor() {
    this.init();
  }

  async init() {
    if (isInitialized) return;
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        memoryPreferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      // In-memory fallback
    } finally {
      isInitialized = true;
    }
  }

  getPreferences() {
    return { ...memoryPreferences };
  }

  async savePreferences(newPreferences) {
    memoryPreferences = { ...memoryPreferences, ...newPreferences };
    try {
      await AsyncStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(memoryPreferences)
      );
    } catch (e) {
      // In-memory fallback
    }
    return { ...memoryPreferences };
  }

  async updateJobTitles(jobTitles) {
    return this.savePreferences({ jobTitles });
  }

  async addJobTitle(title) {
    if (!title || !title.trim()) return this.getPreferences();
    const cleanTitle = title.trim();
    const current = memoryPreferences.jobTitles || [];
    if (current.length >= 10 || current.includes(cleanTitle)) {
      return this.getPreferences();
    }
    return this.savePreferences({ jobTitles: [...current, cleanTitle] });
  }

  async removeJobTitle(titleToRemove) {
    const current = memoryPreferences.jobTitles || [];
    const filtered = current.filter((t) => t !== titleToRemove);
    return this.savePreferences({ jobTitles: filtered });
  }

  async updateWorkSchedule(workSchedule) {
    return this.savePreferences({ workSchedule });
  }

  async updateJobTypes(jobTypes) {
    return this.savePreferences({ jobTypes });
  }

  async updateMinimumPay(minimumPay) {
    return this.savePreferences({ minimumPay });
  }

  async updateRemotePreference(remotePreference) {
    return this.savePreferences({ remotePreference });
  }

  async updateCommute(commute) {
    return this.savePreferences({ commute });
  }

  async updateRelocation(relocation) {
    return this.savePreferences({ relocation });
  }

  async addRelocationLocation(location) {
    if (!location || !location.trim()) return this.getPreferences();
    const cleanLoc = location.trim();
    const currentReloc = memoryPreferences.relocation || { locations: [], openToAnywhere: false };
    const locs = currentReloc.locations || [];
    if (locs.length >= 3 || locs.includes(cleanLoc)) {
      return this.getPreferences();
    }
    return this.savePreferences({
      relocation: {
        ...currentReloc,
        locations: [...locs, cleanLoc],
      },
    });
  }

  async removeRelocationLocation(locationToRemove) {
    const currentReloc = memoryPreferences.relocation || { locations: [], openToAnywhere: false };
    const locs = currentReloc.locations || [];
    return this.savePreferences({
      relocation: {
        ...currentReloc,
        locations: locs.filter((l) => l !== locationToRemove),
      },
    });
  }

  async updateAvailability(availability) {
    return this.savePreferences({ availability });
  }

  async deletePreferenceSection(sectionKey) {
    switch (sectionKey) {
      case 'jobTitles':
        return this.savePreferences({ jobTitles: [] });
      case 'workSchedule':
        return this.savePreferences({ workSchedule: { days: [], shifts: [] } });
      case 'jobTypes':
        return this.savePreferences({ jobTypes: [] });
      case 'minimumPay':
        return this.savePreferences({ minimumPay: { amount: 0, period: 'year' } });
      case 'remotePreference':
        return this.savePreferences({ remotePreference: 'all' });
      case 'commute':
        return this.savePreferences({ commute: { location: '', maxMinutes: null } });
      case 'relocation':
        return this.savePreferences({ relocation: { locations: [], openToAnywhere: false } });
      case 'availability':
        return this.savePreferences({ availability: 'immediately' });
      default:
        return this.getPreferences();
    }
  }
}

export const preferenceService = new PreferenceService();
export default preferenceService;
