import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and email verification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle email verification required (if backend sends specific error)
    if (error.response?.status === 403 && error.response?.data?.code === 'email_not_verified') {
      // Redirect to email verification
      window.location.href = '/verify-email';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/token/refresh/', {
          refresh: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/accounts/auth/login/', credentials),
  register: (userData) => api.post('/accounts/signup/', userData),
  logout: () => api.get('/accounts/auth/logout/'),
  refreshToken: (refresh) => api.post('/token/refresh/', { refresh }),
  
  // Password Reset
  requestPasswordReset: (email) => api.post('/accounts/auth/password/request-token/', { email }),
  validateResetToken: (token) => api.get(`/accounts/auth/password/${token}/reset/`),
  confirmPasswordReset: (token, password) => api.post(`/accounts/auth/password/${token}/reset/`, { 
    forgot_password_token: token, 
    password 
  }),
  
  // Change Password (for authenticated users)
  changePassword: (oldPassword, newPassword) => api.post('/accounts/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  }),
  
  // Email Verification
  verifyEmail: (token) => api.post('/accounts/verifications/email/', { token }),
  resendEmailVerification: () => api.post('/accounts/verifications/resend-email-token/'),
};

// Trip API
export const tripAPI = {
  // Plan a new trip
  planTrip: (tripData) => api.post('/eld/trips/plan_trip/', tripData),
  
  // Get all trips for current user
  getTrips: () => api.get('/eld/trips/'),
  
  // Get specific trip
  getTrip: (tripId) => api.get(`/eld/trips/${tripId}/`),
  
  // Get trip route
  getTripRoute: (tripId) => api.get(`/eld/trips/${tripId}/route/`),
  
  // Get trip logs
  getTripLogs: (tripId) => api.get(`/eld/trips/${tripId}/logs/`),
  
  // Generate logs for trip
  generateLogs: (tripId, logData) => api.post(`/eld/trips/${tripId}/generate_logs/`, logData),
  
  // Update trip
  updateTrip: (tripId, tripData) => api.put(`/eld/trips/${tripId}/`, tripData),
  
  // Delete trip
  deleteTrip: (tripId) => api.delete(`/eld/trips/${tripId}/`),
};

// Log Entry API
export const logAPI = {
  // Get all log entries
  getLogs: () => api.get('/eld/log-entries/'),
  
  // Get specific log entry
  getLog: (logId) => api.get(`/eld/log-entries/${logId}/`),
  
  // Download log as PDF
  downloadPDF: (logId) => api.get(`/eld/log-entries/${logId}/download_pdf/`),
  
  // Download log as image
  downloadImage: (logId) => api.get(`/eld/log-entries/${logId}/download_image/`),
};

// Route API
export const routeAPI = {
  // Get all routes
  getRoutes: () => api.get('/eld/routes/'),
  
  // Get specific route
  getRoute: (routeId) => api.get(`/eld/routes/${routeId}/`),
  
  // Get map data for route
  getMapData: (routeId) => api.get(`/eld/routes/${routeId}/map_data/`),
};

// Convenience functions for common operations
export const planTrip = async (tripData) => {
  const response = await tripAPI.planTrip(tripData);
  return response.data.data || response.data;
};

export const getTrip = async (tripId) => {
  const response = await tripAPI.getTrip(tripId);
  return response.data.data || response.data;
};

export const getTripLogs = async (tripId) => {
  const response = await tripAPI.getTripLogs(tripId);
  return response.data.data || response.data;
};

export const generateLogs = async (tripId, startDate) => {
  const response = await tripAPI.generateLogs(tripId, { start_date: startDate });
  return response.data.data || response.data;
};

export const getTripRoute = async (tripId) => {
  const response = await tripAPI.getTripRoute(tripId);
  return response.data.data || response.data;
};

export const getTrips = async () => {
  const response = await tripAPI.getTrips();
  return response.data.data || response.data;
};

// Utility function to parse API errors consistently
export const parseApiError = (error) => {
  if (error.response?.data) {
    const responseData = error.response.data;
    
    // Handle nested error structure: { error: { field: [messages] } }
    const errors = responseData.error || responseData;
    
    if (typeof errors === 'object' && !Array.isArray(errors)) {
      const errorMessages = [];
      Object.keys(errors).forEach(field => {
        if (Array.isArray(errors[field])) {
          errorMessages.push(`${field}: ${errors[field].join(', ')}`);
        } else {
          errorMessages.push(`${field}: ${errors[field]}`);
        }
      });
      return errorMessages.join('. ');
    } else if (Array.isArray(errors)) {
      return errors.join(', ');
    } else {
      return responseData.message || errors || 'Request failed';
    }
  }
  return 'Request failed. Please try again.';
};

export default api; 