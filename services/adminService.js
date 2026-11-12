import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_TOKEN_KEY = '@superadmin_token';

class AdminService {
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
      return token;
    } catch {
      return null;
    }
  }

  async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(ADMIN_TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
      }
    } catch {}
  }

  // B1. Revenue Transactions
  // GET /api/admin/revenue/transactions
  async getRevenueTransactions({
    page = 1,
    limit = 10,
    userType = 'all',
    status = 'all',
    paymentMethod = 'all',
    search,
    from,
    to,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    token = null,
  } = {}) {
    const adminToken = token || (await this.getToken());
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (userType && userType !== 'all') params.append('userType', userType);
    if (status && status !== 'all') params.append('status', status);
    if (paymentMethod && paymentMethod !== 'all') params.append('paymentMethod', paymentMethod);
    if (search) params.append('search', search);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.REVENUE_TRANSACTIONS}${queryString}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
        }
      );

      const json = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        status: response.status,
        data: json?.data || [],
        pagination: json?.pagination || null,
        message: json?.message,
      };
    } catch (e) {
      console.log('getRevenueTransactions error:', e.message);
      return { success: false, message: e.message, data: [] };
    }
  }

  // B2. Revenue Overview (Dashboard)
  // GET /api/admin/dashboard/revenue-overview
  async getRevenueOverview({
    year = new Date().getFullYear(),
    viewType = 'yearly',
    month = null,
    token = null,
  } = {}) {
    const adminToken = token || (await this.getToken());
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (viewType) params.append('viewType', viewType);
    if (viewType === 'monthly' && month) params.append('month', month);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.REVENUE_OVERVIEW}${queryString}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
        }
      );

      const json = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        status: response.status,
        data: json?.data || null,
        message: json?.message,
      };
    } catch (e) {
      console.log('getRevenueOverview error:', e.message);
      return { success: false, message: e.message, data: null };
    }
  }

  // B3. Invoice Download
  // GET /api/admin/employer-billing-transactions/:id/invoice-download
  async downloadInvoice(transactionId, token = null) {
    if (!transactionId) return { success: false, message: 'Transaction ID required' };
    const adminToken = token || (await this.getToken());

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.INVOICE_DOWNLOAD(transactionId)}`,
        {
          method: 'GET',
          headers: {
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        return {
          success: true,
          status: response.status,
          blob,
        };
      }

      const json = await response.json().catch(() => ({}));
      return {
        success: false,
        status: response.status,
        message: json?.message || 'Invoice not available or transaction unpaid',
      };
    } catch (e) {
      console.log('downloadInvoice error:', e.message);
      return { success: false, message: e.message };
    }
  }

  // B4. Existing Updated Admin APIs
  async getEmployerBillingTransactions({ page = 1, limit = 10, token = null } = {}) {
    const adminToken = token || (await this.getToken());
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMIN_EMPLOYER_BILLING_TRANSACTIONS}?page=${page}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
        }
      );
      const json = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        status: response.status,
        data: json?.data || [],
        pagination: json?.pagination || null,
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async getAdminDashboard(token = null) {
    const adminToken = token || (await this.getToken());
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_DASHBOARD}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
      });
      const json = await response.json().catch(() => ({}));
      return { success: response.ok, status: response.status, data: json?.data || json };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async getRevenueAnalytics(token = null) {
    const adminToken = token || (await this.getToken());
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_REVENUE_ANALYTICS}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
      });
      const json = await response.json().catch(() => ({}));
      return { success: response.ok, status: response.status, data: json?.data || json };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
}

export default new AdminService();
