import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import candidateService from './candidateService';
import {
  formatJobLocation,
  extractLocationCity,
  normalizeJob,
  normalizeJobLocationsList,
  normalizeJobTitlesList,
  stripHtml,
} from '../utils/jobFormatters';

// In-memory state holding real jobs, bookmarked IDs, and applied jobs populated from API
let jobsStore = [];
let appliedRecordsStore = [];
let savedRecordsStore = [];
let hrUpdatesStore = [];

let savedJobIds = new Set();
let appliedJobIds = new Set();
let currentAuthToken = null;

// Caches to avoid duplicate API calls
const searchCache = new Map();
const SEARCH_CACHE_TTL = 30 * 1000; // 30 seconds

let jobAlertsCache = null;
let jobAlertsCacheTime = 0;
const ALERTS_CACHE_TTL = 30 * 1000; // 30 seconds

let savedJobsBackendCache = null;
let savedJobsCacheTime = 0;
const SAVED_JOBS_CACHE_TTL = 20 * 1000; // 20 seconds

async function resolveToken() {
  if (currentAuthToken) return currentAuthToken;
  try {
    const { getToken } = require('../src/storage/authStorage');
    const t = await getToken();
    if (t) {
      currentAuthToken = t;
      return t;
    }
  } catch {
    // Continue
  }
  return null;
}

export const setAuthToken = (token) => {
  currentAuthToken = token;
};

export const getAuthToken = () => currentAuthToken;

export const jobService = {
  // 1. Search jobs with keyword, location, jobType, salary filtering (API 10 in PRD)
  // Live endpoint: GET /api/jobseeker/search/jobsearch
  async searchJobs({ keyword = '', location = '', jobType = '', experience = '', salaryMin = 0, salaryMax = 999999, sort = 'latest' } = {}) {
    const cacheKey = JSON.stringify({ keyword, location, jobType, experience, salaryMin, salaryMax, sort });
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.time < SEARCH_CACHE_TTL)) {
      return cached.data;
    }

    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location && location !== 'All') params.append('location', location);
    if (jobType && jobType !== 'All') params.append('jobType', jobType);
    if (experience) params.append('experience', experience);
    params.append('sort', sort);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SEARCH_JOBS}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        const list = json.data || json.jobs || [];
        if (Array.isArray(list)) {
          const mapped = list
            .map((j) => normalizeJob(j, savedJobIds, appliedJobIds))
            .filter(Boolean);
          searchCache.set(cacheKey, { data: mapped, time: Date.now() });
          jobsStore = mapped;
          return mapped;
        }
      }
    } catch (e) {
      console.log('searchJobs network error:', e.message);
    }

    return [];
  },

  // 2. Dropdown filter options (from API 18 in PDF page 43)
  // Live endpoint: GET /api/jobseeker/job-alert/getFilterDropDownDetails
  async getFilterOptions() {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_FILTER_DROPDOWNS}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.jobLocations || json.jobTitles) {
          return {
            jobTitles: normalizeJobTitlesList(json.jobTitles || []),
            jobLocations: normalizeJobLocationsList(json.jobLocations || [], true),
            jobTypes: ['All', 'Full-Time', 'Part-Time', 'Remote', 'Internship'],
            salaryRanges: [
              { label: 'All Salaries', min: 0, max: 999999 },
              { label: '$50k - $80k', min: 50000, max: 80000 },
              { label: '$80k - $120k', min: 80000, max: 120000 },
              { label: '$120k - $160k', min: 120000, max: 160000 },
              { label: '$160k+', min: 160000, max: 999999 },
            ],
          };
        }
      }
    } catch (e) {
      console.log('getFilterOptions network error:', e.message);
    }

    return {
      jobTitles: [],
      jobLocations: ['All'],
      jobTypes: ['All', 'Full-Time', 'Part-Time', 'Remote', 'Internship'],
      salaryRanges: [
        { label: 'All Salaries', min: 0, max: 999999 },
        { label: '$50k - $80k', min: 50000, max: 80000 },
        { label: '$80k - $120k', min: 80000, max: 120000 },
        { label: '$120k - $160k', min: 120000, max: 160000 },
        { label: '$160k+', min: 160000, max: 999999 },
      ],
    };
  },

  // 3. Get single job details by ID
  // Live endpoint: GET /api/jobseeker/job-alert/getJobDetails?jobId=<id>
  async getJobById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_DETAILS}?jobId=${id}`);
      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          const item = Array.isArray(json.data) ? json.data[0] : json.data;
          return normalizeJob(item, savedJobIds, appliedJobIds);
        }
      }
    } catch (e) {
      console.log('getJobById network error:', e.message);
    }

    const found = jobsStore.find((j) => j._id === id);
    return found ? normalizeJob(found, savedJobIds, appliedJobIds) : null;
  },

  // 4. Toggle save job with synchronization across backend and cache
  // Live endpoint: POST /api/jobseeker/saved-job/toggleJob
  async toggleSaveJob(id) {
    const isCurrentlySaved = savedJobIds.has(id);
    if (isCurrentlySaved) {
      savedJobIds.delete(id);
      const existing = savedRecordsStore.find((r) => r._id === id);
      if (existing) existing.isSaved = false;
    } else {
      savedJobIds.add(id);
      const existing = savedRecordsStore.find((r) => r._id === id);
      if (existing) {
        existing.isSaved = true;
      }
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = await resolveToken();
      if (!token) {
        // Revert optimistic toggle if not authenticated
        if (isCurrentlySaved) {
          savedJobIds.add(id);
        } else {
          savedJobIds.delete(id);
        }
        return isCurrentlySaved;
      }

      headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TOGGLE_SAVED_JOB}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobId: id }),
      });

      if (response.ok) {
        const json = await response.json().catch(() => null);
        if (json && typeof json.isSaved === 'boolean') {
          savedJobsBackendCache = null;
          if (json.isSaved) {
            savedJobIds.add(id);
          } else {
            savedJobIds.delete(id);
          }
          return json.isSaved;
        }
      } else {
        // Revert on backend error
        if (isCurrentlySaved) {
          savedJobIds.add(id);
        } else {
          savedJobIds.delete(id);
        }
        return isCurrentlySaved;
      }
    } catch (e) {
      console.log('toggleSaveJob network error:', e.message);
      // Revert on network exception
      if (isCurrentlySaved) {
        savedJobIds.add(id);
      } else {
        savedJobIds.delete(id);
      }
      return isCurrentlySaved;
    }

    savedJobsBackendCache = null;
    return savedJobIds.has(id);
  },

  // 5. Fetch matching jobs from Job Alerts API (Item 7 in PRD)
  // Live endpoint: GET /api/jobseeker/job-alert/jobalerts (Requires Bearer Token)
  async getJobAlerts({ page = 1, forceRefresh = false } = {}) {
    if (!forceRefresh && jobAlertsCache && (Date.now() - jobAlertsCacheTime < ALERTS_CACHE_TTL)) {
      return jobAlertsCache;
    }

    const token = await resolveToken();
    if (token) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOB_ALERTS}?page=${page}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          const rawJobs = json.data || [];
          if (Array.isArray(rawJobs)) {
            const normalized = rawJobs
              .map((j) => normalizeJob(j, savedJobIds, appliedJobIds))
              .filter(Boolean);
            jobAlertsCache = normalized;
            jobAlertsCacheTime = Date.now();
            return normalized;
          }
        }
      } catch (e) {
        console.log('getJobAlerts network error:', e.message);
      }
    }

    return [];
  },

  // 6. Get saved jobs list (Item 9 in PRD)
  // Live endpoint: GET /api/jobseeker/saved-job/getSavedJobs (Requires Bearer Token)
  async getSavedJobs({ forceRefresh = false } = {}) {
    if (!forceRefresh && savedJobsBackendCache && (Date.now() - savedJobsCacheTime < SAVED_JOBS_CACHE_TTL)) {
      return savedJobsBackendCache;
    }

    const token = await resolveToken();
    if (token) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SAVED_JOBS}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          const rawSaved = json.savedJobs || json.data || [];
          if (Array.isArray(rawSaved)) {
            rawSaved.forEach((item) => {
              const id = item.jobId?._id || item.jobId || item._id;
              if (id) savedJobIds.add(String(id));
            });

            const mapped = rawSaved.map((item) => {
              const jobData = item.jobId && typeof item.jobId === 'object' ? item.jobId : item;
              const norm = normalizeJob(jobData, savedJobIds, appliedJobIds);
              return {
                _id: String(norm?._id || item._id || item.jobId),
                companyName: norm?.companyName || item.jobName || 'Company',
                companyLogo: norm?.companyLogo || '',
                jobTitle: norm?.jobTitle || item.jobName || 'Saved Position',
                jobLocation: formatJobLocation(norm?.jobLocation),
                locationCity: extractLocationCity(norm?.jobLocation || norm?.locationCity),
                salaryFormatted: norm?.salaryFormatted || 'Salary Not Disclosed',
                jobType: norm?.jobType || 'Full-Time',
                category: norm?.category || 'General',
                savedDate: 'Recently',
                status: 'Active',
                expiringBadge: null,
                isSaved: true,
              };
            });

            savedRecordsStore = mapped;
            savedJobsBackendCache = mapped;
            savedJobsCacheTime = Date.now();
            return mapped;
          }
        }
      } catch (e) {
        console.log('getSavedJobs network error:', e.message);
      }
    }

    return [];
  },

  // Get saved jobs with status filter ('All', 'Active', 'Expiring Soon')
  async getSavedJobsWithStatus(filter = 'All') {
    const activeSaved = await this.getSavedJobs();
    if (filter === 'Active') {
      return activeSaved.filter((r) => r.status === 'Active');
    }
    if (filter === 'Expiring Soon') {
      return activeSaved.filter((r) => r.status === 'Expiring Soon');
    }
    return activeSaved;
  },

  // 7. Apply for job (Item 8 in PRD)
  // Live endpoint: POST /api/jobseeker/job-alert/apply
  async applyForJob(id, applicationData = {}) {
    if (appliedJobIds.has(id)) {
      return {
        success: false,
        alreadyApplied: true,
        message: 'You have already applied for this job.',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const headers = { 'Content-Type': 'application/json' };
      const token = await resolveToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPLY_JOB}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jobId: id,
          experience: applicationData.experience || '3 years',
          currentCTC: applicationData.currentCTC || '30 LPA',
          expectedCTC: applicationData.expectedCTC || '40 LPA',
          noticePeriod: applicationData.noticePeriod || '30 Days',
          immediateJoiner: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json().catch(() => null);

      if (response.ok || (json && json.message && json.message.toLowerCase().includes('success'))) {
        this._recordApplicationSuccess(id, applicationData);
        return {
          success: true,
          alreadyApplied: false,
          message: json?.message || 'Applied for the job successfully',
        };
      }

      if (response.status === 400 && json?.message && json.message.toLowerCase().includes('already applied')) {
        this._recordApplicationSuccess(id, applicationData);
        return {
          success: false,
          alreadyApplied: true,
          message: json.message,
        };
      }

      return {
        success: false,
        alreadyApplied: false,
        message: json?.message || `Failed to submit application (HTTP ${response.status})`,
      };
    } catch (e) {
      console.log('applyForJob network error:', e.message);
      return {
        success: false,
        alreadyApplied: false,
        message: e.message || 'Network error while submitting job application',
      };
    }
  },

  _recordApplicationSuccess(id, applicationData = {}) {
    appliedJobIds.add(id);
    const existing = jobsStore.find((j) => j._id === id);
    const normalized = existing ? normalizeJob(existing, savedJobIds, appliedJobIds) : null;

    const newRecord = {
      _id: id,
      companyName: normalized?.companyName || applicationData.company || 'Company',
      companyLogo: normalized?.companyLogo || '',
      jobTitle: normalized?.jobTitle || applicationData.title || 'Position',
      jobLocation: formatJobLocation(normalized?.jobLocation),
      locationCity: extractLocationCity(normalized?.jobLocation || normalized?.locationCity),
      salaryFormatted: normalized?.salaryFormatted || 'Salary Not Disclosed',
      jobType: normalized?.jobType || 'Full-Time',
      category: normalized?.category || 'General',
      appliedDate: 'Today',
      appliedTimestamp: Date.now(),
      statusCategory: 'In Progress',
      statusLabel: 'Applied',
      statusColor: '#10B981',
      statusBg: '#E8F8F0',
      statusIcon: 'checkmark',
      isSaved: savedJobIds.has(id),
      timeline: [
        { id: '1', title: 'Applied', date: 'Today', remark: 'Your application has been submitted successfully.', state: 'completed' },
        { id: '2', title: 'Application Sent', date: 'Today', remark: 'Your application is sent to the employer.', state: 'completed' },
        { id: '3', title: 'Application Viewed', date: '', remark: 'Recruiter will view your application.', state: 'current' },
        { id: '4', title: 'Profile Shortlisted', date: '', remark: 'Pending recruiter review.', state: 'pending' },
        { id: '5', title: 'Interview Scheduled', date: '', remark: 'Awaiting schedule.', state: 'pending' },
        { id: '6', title: 'Interview Completed', date: '', remark: 'Awaiting feedback.', state: 'pending' },
        { id: '7', title: 'Final Decision', date: '', remark: 'Result will be updated here.', state: 'pending' },
      ],
    };

    appliedRecordsStore = [newRecord, ...appliedRecordsStore.filter((r) => r._id !== id)];
  },

  // 8. Get applied jobs list
  // Live endpoint: GET /api/jobseeker/job-alert/getAppliedJobs
  async getAppliedJobs() {
    const token = await resolveToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPLIED_JOBS}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const json = await response.json();
          const rawApplied = json.data || json.appliedJobs || [];
          if (Array.isArray(rawApplied)) {
            rawApplied.forEach((a) => {
              const id = a.jobId?._id || a.jobId || a._id;
              if (id) appliedJobIds.add(String(id));
            });
            const mapped = rawApplied.map((item) => {
              const jobData = item.jobId && typeof item.jobId === 'object' ? item.jobId : item;
              const norm = normalizeJob(jobData, savedJobIds, appliedJobIds);
              return {
                _id: String(norm?._id || item._id || item.jobId),
                companyName: norm?.companyName || item.companyName || 'Company',
                companyLogo: norm?.companyLogo || '',
                jobTitle: norm?.jobTitle || item.jobTitle || 'Applied Position',
                jobLocation: formatJobLocation(norm?.jobLocation),
                locationCity: extractLocationCity(norm?.jobLocation || norm?.locationCity),
                salaryFormatted: norm?.salaryFormatted || 'Salary Not Disclosed',
                jobType: norm?.jobType || 'Full-Time',
                category: norm?.category || 'General',
                appliedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Recently',
                statusCategory: item.status || 'In Progress',
                statusLabel: item.status || 'Applied',
                statusColor: '#10B981',
                statusBg: '#E8F8F0',
                statusIcon: 'checkmark',
                isSaved: savedJobIds.has(String(norm?._id || item._id)),
              };
            });
            appliedRecordsStore = mapped;
            return mapped;
          }
        }
      } catch (e) {
        console.log('getAppliedJobs network error:', e.message);
      }
    }
    return appliedRecordsStore;
  },

  // Get applied jobs with status filter ('All', 'In Progress', 'Shortlisted', 'Interview')
  async getAppliedJobsWithStatus(filter = 'All') {
    const list = await this.getAppliedJobs();
    if (filter === 'All') return list;
    if (filter === 'In Progress') {
      return list.filter((r) => r.statusCategory === 'In Progress');
    }
    if (filter === 'Shortlisted') {
      return list.filter((r) => r.statusCategory === 'Shortlisted');
    }
    if (filter === 'Interview') {
      return list.filter((r) => r.statusCategory === 'Interview');
    }
    return list;
  },

  // 9. Get timeline for specific job (PDF Item 1)
  // GET /api/jobseeker/applications/:id/timeline
  async fetchApplicationTimeline(jobId) {
    if (!jobId) return null;
    const token = await resolveToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPLICATION_TIMELINE(jobId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const json = await response.json();
          if (json.timeline && Array.isArray(json.timeline)) {
            const mappedTimeline = json.timeline.map((step, idx) => ({
              id: String(idx + 1),
              title: step.stage || 'Stage',
              date: step.timestamp
                ? new Date(step.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '',
              remark: step.isCompleted ? 'Completed' : (json.currentStatus === step.stage ? 'In Progress' : 'Pending'),
              state: step.isCompleted ? 'completed' : (json.currentStatus === step.stage ? 'current' : 'pending'),
            }));

            const record = appliedRecordsStore.find((r) => r._id === jobId) || {
              _id: jobId,
              jobTitle: json.jobTitle || 'Position',
              companyName: json.companyName || 'Company',
              statusLabel: json.currentStatus || 'In Progress',
            };

            return {
              job: record,
              timeline: mappedTimeline,
              currentStatus: json.currentStatus,
            };
          }
        }
      } catch (e) {
        console.log('fetchApplicationTimeline network error:', e.message);
      }
    }

    return this.getApplicationTimeline(jobId);
  },

  getApplicationTimeline(jobId) {
    let record = null;
    if (jobId) {
      record = appliedRecordsStore.find((r) => r._id === jobId);
    }
    if (!record && appliedRecordsStore.length > 0) {
      record = appliedRecordsStore[0];
    }
    if (!record) {
      record = {
        _id: 'default-app-1',
        jobTitle: 'UI/UX Designer',
        companyName: 'Local Trade Street Pvt Ltd',
        locationCity: 'Nagpur',
        statusLabel: 'Under Review',
        appliedDate: 'Recently',
        timeline: [
          { id: '1', title: 'Application Submitted', date: '2 Days Ago', remark: 'Your profile and resume were received successfully.', state: 'completed' },
          { id: '2', title: 'Application Viewed', date: 'Yesterday', remark: 'Hiring team reviewed your application and qualifications.', state: 'completed' },
          { id: '3', title: 'Resume Shortlisted', date: 'Today', remark: 'Selected for initial screening round.', state: 'current' },
          { id: '4', title: 'Interview Scheduling', date: 'Upcoming', remark: 'HR will contact you for technical discussion.', state: 'pending' },
          { id: '5', title: 'Final Decision', date: 'Pending', remark: 'Result will be updated upon interview completion.', state: 'pending' },
        ],
      };
    }

    if (record) {
      const tl = (record.timeline && record.timeline.length > 0)
        ? record.timeline
        : [
            { id: '1', title: 'Application Submitted', date: record.appliedDate || 'Recently', remark: 'Your application was received.', state: 'completed' },
            { id: '2', title: 'Application Viewed', date: 'Today', remark: 'Reviewed by recruitment team.', state: 'current' },
            { id: '3', title: 'Profile Evaluation', date: 'Upcoming', remark: 'Department evaluation in progress.', state: 'pending' },
            { id: '4', title: 'Interview Round', date: 'Upcoming', remark: 'Pending interview slot confirmation.', state: 'pending' },
          ];
      return {
        job: record,
        timeline: tl,
      };
    }
    return null;
  },

  // 10. Get candidate-wide HR updates from backend (PDF Item 3)
  // GET /api/jobseeker/hr-updates
  async getHRUpdates(filter = 'All') {
    const token = await resolveToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HR_UPDATES}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const json = await response.json();
          const rawUpdates = json.data || [];
          if (Array.isArray(rawUpdates) && rawUpdates.length > 0) {
            hrUpdatesStore = rawUpdates.map((u) => {
              const isInterview = (u.type || '').toLowerCase().includes('interview');
              return {
                id: u.id || u._id,
                applicationId: u.applicationId,
                title: isInterview ? 'Interview Invitation' : (u.companyName ? `Message from ${u.companyName}` : 'HR Update'),
                subtitle: u.companyName || 'Recruiter Update',
                body: u.message || '',
                type: isInterview ? 'interview' : 'message',
                isRead: Boolean(u.isRead),
                timestamp: u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Recently',
                icon: isInterview ? 'calendar' : 'chatbubble-ellipses',
                iconBg: isInterview ? '#E6FBF7' : '#EFF6FF',
                iconColor: isInterview ? '#0D9488' : '#3B82F6',
              };
            });
          }
        }
      } catch (e) {
        console.log('getHRUpdates network error:', e.message);
      }
    }

    const activeList = hrUpdatesStore.length > 0 ? hrUpdatesStore : [
      {
        id: 'hr-1',
        applicationId: 'app-1',
        title: 'Profile Shortlisted',
        subtitle: 'Local Trade Street Pvt Ltd',
        body: 'Congratulations! Your profile has been shortlisted for UI/UX Designer. The hiring team will schedule a call soon.',
        type: 'message',
        isRead: false,
        timestamp: 'Today',
        icon: 'checkmark-circle',
        iconBg: '#EFF6FF',
        iconColor: '#3B82F6',
      },
      {
        id: 'hr-2',
        applicationId: 'app-2',
        title: 'Interview Invitation',
        subtitle: 'Technokrate Solutions',
        body: 'You are invited to a technical interview round. Please check your registered email for meeting link details.',
        type: 'interview',
        isRead: false,
        timestamp: 'Yesterday',
        icon: 'calendar',
        iconBg: '#E6FBF7',
        iconColor: '#0D9488',
      },
    ];

    if (filter === 'All') return activeList;
    if (filter.toLowerCase().includes('interview')) {
      return activeList.filter((u) => u.type === 'interview');
    }
    if (filter.toLowerCase().includes('message')) {
      return activeList.filter((u) => u.type === 'message');
    }
    return activeList;
  },

  // Mark HR update as read (PDF Item 4)
  // PATCH /api/jobseeker/hr-updates/:updateId/read
  async markHRUpdateAsRead(updateId) {
    if (!updateId) return false;
    // Optimistic local update
    const item = hrUpdatesStore.find((u) => u.id === updateId);
    if (item) item.isRead = true;

    const token = await resolveToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HR_UPDATE_READ(updateId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        return response.ok;
      } catch (e) {
        console.log('markHRUpdateAsRead network error:', e.message);
      }
    }
    return true;
  },

  // 11. Withdraw application (PDF Item 16)
  // POST /api/jobseeker/applications/:id/withdraw
  async withdrawApplication(id, reason = '') {
    appliedJobIds.delete(id);
    appliedRecordsStore = appliedRecordsStore.filter((r) => r._id !== id);
    const item = jobsStore.find((j) => j._id === id);
    if (item) item.isApplied = false;

    const token = await resolveToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WITHDRAW_APPLICATION(id)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: reason || 'Application withdrawn by candidate' }),
        });

        const json = await response.json().catch(() => ({}));
        if (response.ok) {
          return { success: true, message: json.message || 'Application withdrawn successfully' };
        }
        return { success: false, message: json.message || 'Unable to withdraw application' };
      } catch (e) {
        console.log('withdrawApplication network error:', e.message);
      }
    }
    return { success: true, message: 'Application withdrawn locally' };
  },

  // 12. Dynamic tracking summary for the 4 dashboard functional tracking boxes
  getTrackingSummary() {
    const totalApplied = appliedRecordsStore.length;
    const inProgress = appliedRecordsStore.filter((r) => r.statusCategory === 'In Progress').length;
    const shortlisted = appliedRecordsStore.filter((r) => r.statusCategory === 'Shortlisted').length;
    const interview = appliedRecordsStore.filter((r) => r.statusCategory === 'Interview').length;
    const others = appliedRecordsStore.filter((r) => r.statusCategory === 'Others').length;

    const activeSaved = savedRecordsStore.filter((r) => r.isSaved);
    const totalSaved = activeSaved.length;
    const expiringSoon = activeSaved.filter((r) => r.status === 'Expiring Soon').length;
    const active = activeSaved.filter((r) => r.status === 'Active').length;
    const expired = savedRecordsStore.filter((r) => r.status === 'Expired').length;

    return {
      applied: {
        total: totalApplied,
        thisWeek: 0,
        inProgress,
        shortlisted,
        interview,
        others,
      },
      saved: {
        total: totalSaved,
        expiringSoon,
        active,
        expired,
      },
      status: {
        applied: totalApplied,
        viewed: 0,
        shortlisted,
        interview,
        selected: 0,
        rejected: 0,
      },
      hr: {
        interviewRequests: 0,
        messages: 0,
        statusUpdates: 0,
        offers: 0,
      },
    };
  },

  // 13. Stats for candidate home dashboard
  getDashboardMetrics() {
    const profile = candidateService.getUserProfile();
    const tracking = this.getTrackingSummary();
    const displayName = profile.fullName ? profile.fullName.trim() : 'Job Seeker';
    const headline = profile.role
      ? (profile.location ? `${profile.role} • ${profile.location}` : profile.role)
      : 'Find your dream job';

    return {
      candidateName: displayName,
      headline,
      tracking,
      interviewRequestsCount: tracking.hr.interviewRequests,
      appliedCount: tracking.applied.total,
      savedCount: tracking.saved.total,
      recommendationsCount: jobsStore.length,
    };
  },
};

export default jobService;
