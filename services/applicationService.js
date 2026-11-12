import candidateService from './candidateService';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from '../src/storage/authStorage';

class ApplicationService {
  constructor() {
    this.state = this._getInitialState();
    this.listeners = new Set();
  }

  _getInitialState(job = null) {
    const profile = candidateService ? candidateService.getUserProfile() : {};
    const resume = candidateService ? candidateService.getCurrentResume() : {};

    const fullName = profile.fullName || '';
    const parts = fullName ? fullName.split(' ') : [];
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    return {
      jobId: job?._id || '',
      jobTitle: job?.jobTitle || '',
      companyName: job?.companyName || '',
      jobLocation: job?.jobLocation || '',
      salaryFormatted: job?.salaryFormatted || '',

      // Contact Information (Screen 2)
      firstName: firstName,
      lastName: lastName,
      email: profile.email || '',
      phoneCountryCode: '+91',
      phoneNumber: profile.phone || '',

      // Location (Screen 3)
      country: 'India',
      postalCode: '',
      cityState: profile.location || '',
      area: '',
      streetAddress: '',

      // Resume (Screen 4)
      resume: resume?.fileName
        ? {
            fileName: resume.fileName,
            updatedDate: 'Recently',
            candidateName: fullName,
            fileSize: resume.fileSize || '',
            url: resume.url || '',
          }
        : null,

      // Supporting Documents (Screen 5)
      coverLetterOption: 'write', // 'write' | 'none'
      coverLetter: 'I am very interested in this role and believe my skills and projects make me a good fit for this position...',
      additionalDocuments: [
        {
          id: 'doc-1',
          fileName: 'Portfolio.pdf',
          fileSize: '1.2 MB',
          type: 'application/pdf',
        },
      ],

      // Review & Submit (Screen 6)
      getAlerts: true,
      consent: true,
      returnToReview: false,
    };
  }

  initForJob(job) {
    if (!this.state || (job?._id && this.state.jobId !== job._id)) {
      this.state = this._getInitialState(job);
    } else if (job) {
      this.state.jobTitle = job.jobTitle || this.state.jobTitle;
      this.state.companyName = job.companyName || this.state.companyName;
      this.state.jobLocation = job.jobLocation || this.state.jobLocation;
      this.state.salaryFormatted = job.salaryFormatted || this.state.salaryFormatted;
    }
    this._notify();
    return this.state;
  }

  getApplicationData() {
    return this.state;
  }

  updateApplicationData(partial) {
    this.state = {
      ...this.state,
      ...partial,
    };
    this._notify();
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('ApplicationService listener error:', e);
      }
    }
  }

  reset() {
    this.state = this._getInitialState();
    this._notify();
  }

  // 1. Fetch Application Timeline (PDF Item 1)
  // GET /api/jobseeker/applications/:id/timeline
  async fetchApplicationTimeline(applicationId) {
    if (!applicationId) return null;
    try {
      const token = await getToken().catch(() => null);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.APPLICATION_TIMELINE(applicationId)}`,
        { method: 'GET', headers }
      );

      if (response.ok) {
        const json = await response.json();
        return json;
      }
    } catch (e) {
      console.log('fetchApplicationTimeline network error:', e.message);
    }
    return null;
  }

  // 2. Fetch Application HR Updates (PDF Item 2)
  // GET /api/jobseeker/applications/:id/updates
  async fetchApplicationUpdates(applicationId) {
    if (!applicationId) return [];
    try {
      const token = await getToken().catch(() => null);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.APPLICATION_UPDATES(applicationId)}`,
        { method: 'GET', headers }
      );

      if (response.ok) {
        const json = await response.json();
        return json.data || [];
      }
    } catch (e) {
      console.log('fetchApplicationUpdates network error:', e.message);
    }
    return [];
  }

  // 3. Withdraw Application (PDF Item 16)
  // POST /api/jobseeker/applications/:id/withdraw
  async withdrawApplication(applicationId, reason = '') {
    if (!applicationId) return { success: false, message: 'Invalid Application ID' };
    try {
      const token = await getToken().catch(() => null);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.WITHDRAW_APPLICATION(applicationId)}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ reason: reason || 'Application withdrawn by candidate' }),
        }
      );

      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        return { success: true, message: json.message || 'Application withdrawn successfully', data: json.data };
      }
      return { success: false, message: json.message || 'Cannot withdraw application' };
    } catch (e) {
      console.log('withdrawApplication network error:', e.message);
      return { success: false, message: e.message || 'Network error while withdrawing' };
    }
  }
}

export const applicationService = new ApplicationService();
export default applicationService;
