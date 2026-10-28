/**
 * Smart Service Hub API Client Service
 * Centralized HTTP request handler with credentials (cookies), CSRF protection,
 * normalized error handling, and performance latency measurement.
 *
 * SECURITY NOTE:
 * Sessions are strictly managed via HTTP-only cookies ('ssh_session').
 * We NEVER store passwords, session tokens, or credentials in localStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Custom API Error class with normalized status and code
 */
export class ApiError extends Error {
  constructor(message, status = 500, details = null, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

/**
 * Helper to read non-httpOnly cookies (such as XSRF-TOKEN)
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Standardized request helper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const timeoutMs = options.timeout || 10000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const csrfToken = getCookie('XSRF-TOKEN');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Anti-CSRF custom header
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
    ...options.headers
  };

  try {
    const startTime = performance.now();
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Crucial: Send and accept HTTP-only session cookies
      headers: defaultHeaders,
      signal: controller.signal
    });
    const latencyMs = Math.round(performance.now() - startTime);

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        `Request failed with status ${response.status}`;
      const errorCode =
        (typeof data === 'object' && data?.error?.code) || 'HTTP_ERROR';
      const details =
        (typeof data === 'object' && data?.error?.details) || null;

      throw new ApiError(errorMessage, response.status, details, errorCode);
    }

    return {
      data,
      status: response.status,
      latencyMs
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check server connectivity.', 408, null, 'TIMEOUT');
    }

    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(
      err.message || 'Network connection failed. Is the backend server running?',
      0,
      null,
      'NETWORK_FAILURE'
    );
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),
  getBaseUrl: () => API_BASE_URL,

  // Authentication & Session
  register: (userData) =>
    request('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  login: (credentials) =>
    request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  logout: () =>
    request('/v1/auth/logout', {
      method: 'POST'
    }),

  getMe: () => request('/v1/auth/me'),

  getCsrfToken: () => request('/v1/auth/csrf-token'),

  // Services Catalog & Management
  getServices: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/v1/services${queryString}`);
  },

  getCategories: () => request('/v1/services/categories'),

  getServiceById: (id) => request(`/v1/services/${id}`),

  getMyServices: () => request('/v1/services/my-services'),

  createService: (data) =>
    request('/v1/services', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateService: (id, data) =>
    request(`/v1/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteService: (id) =>
    request(`/v1/services/${id}`, {
      method: 'DELETE'
    }),

  // Bookings Engine
  createBooking: (data) =>
    request('/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMyBookings: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/v1/bookings/my-bookings${queryString}`);
  },

  getBookingById: (id) => request(`/v1/bookings/${id}`),

  updateBookingStatus: (id, data) =>
    request(`/v1/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Reviews & Feedback
  createReview: (data) =>
    request('/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getServiceReviews: (serviceId) => request(`/v1/reviews/service/${serviceId}`),

  getProviderReviews: (providerId) => request(`/v1/reviews/provider/${providerId}`),

  // Provider Onboarding & Public Profiles
  getProviders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/v1/providers${query ? `?${query}` : ''}`);
  },

  getProviderById: (id) => request(`/v1/providers/${id}`),

  onboardProvider: (data) =>
    request('/v1/providers/onboard', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProviderProfile: (data) =>
    request('/v1/providers/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Role-Protected Administrative Verification
  getAdminStats: () => request('/v1/admin/dashboard-stats'),

  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/v1/admin/users${query ? `?${query}` : ''}`);
  },

  updateUserRole: (id, role) =>
    request(`/v1/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),

  updateUserStatus: (id, accountStatus) =>
    request(`/v1/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus })
    }),

  getPendingProviders: () => request('/v1/admin/providers/pending'),

  approveProvider: (id) =>
    request(`/v1/admin/providers/${id}/approve`, {
      method: 'PATCH'
    }),

  rejectProvider: (id) =>
    request(`/v1/admin/providers/${id}/reject`, {
      method: 'PATCH'
    }),

  getAdminBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/v1/admin/bookings${query ? `?${query}` : ''}`);
  }
};

export default api;
