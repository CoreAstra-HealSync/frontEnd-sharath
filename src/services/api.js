import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check for tokens based on endpoint
    let token = localStorage.getItem('token'); // Patient token (default)
    
    // Check current role to determine which token to use
    const role = localStorage.getItem('healsync-role');
    
    // If calling doctor endpoints or user is logged in as doctor, use doctor token
    if (config.url?.includes('/doctor') || 
        config.url?.includes('/doctor-access') ||
        config.url?.includes('/upload-for-patient') || // Doctor uploading for patient
        role === 'doctor') {
      token = localStorage.getItem('doctorToken') || token;
    } 
    // For /access endpoints, check role to determine token
    else if (config.url?.includes('/access')) {
      if (role === 'doctor') {
        token = localStorage.getItem('doctorToken') || token;
      } else if (role === 'patient') {
        token = localStorage.getItem('token') || token;
      }
    }
    // If calling pharmacy endpoints, use pharmacy token
    else if (config.url?.includes('/pharmacy')) {
      token = localStorage.getItem('pharmacyToken') || token;
    }
    // If calling hospital endpoints, use hospital token
    else if (config.url?.includes('/hospital')) {
      token = localStorage.getItem('hospitalToken') || token;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if we're on claim-access page (it has its own flow)
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/claim-access') && !currentPath.includes('/login')) {
        localStorage.removeItem('healsync-token');
        localStorage.removeItem('healsync-user');
        localStorage.removeItem('healsync-role');
        localStorage.removeItem('token');
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('pharmacyToken');
        localStorage.removeItem('hospitalToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
