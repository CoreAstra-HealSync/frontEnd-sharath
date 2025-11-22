import api from './api';

// Patient Authentication
export const patientRegister = (data) => api.post('/auth/sign-up', data);
export const patientLogin = (credentials) => api.post('/auth/login', credentials);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password });

// Doctor Authentication
export const doctorRegister = (data) => api.post('/doctor/sign-up', data);
export const doctorLogin = (credentials) => api.post('/doctor/login', credentials);
export const doctorForgotPassword = (email) => api.post('/doctor/forgot-password', { email });
export const doctorResetPassword = (token, password) => api.post(`/doctor/reset-password/${token}`, { password });

// Pharmacy Authentication
export const pharmacyRegister = (data) => api.post('/pharmacy', data);
export const pharmacyLogin = (credentials) => api.post('/pharmacy/login', credentials);
export const pharmacyForgotPassword = (email) => api.post('/pharmacy/forgot-password', { email });
export const pharmacyResetPassword = (token, password) => api.post(`/pharmacy/reset-password/${token}`, { password });

// Hospital Authentication
export const hospitalRegister = (data) => api.post('/hospital/sign-up', data);
export const hospitalLogin = (credentials) => api.post('/hospital/login', credentials);
export const hospitalForgotPassword = (email) => api.post('/hospital/forgot-password', { email });
export const hospitalResetPassword = (token, password) => api.post(`/hospital/reset-password/${token}`, { password });

// Hospital Doctor Management
export const createDoctorByHospital = (data) => api.post('/hospital/create-doctor', data);
export const getHospitalDoctors = () => api.get('/hospital/doctors');
export const getDoctorStats = () => api.get('/hospital/doctors/stats');
export const getDoctorById = (doctorId) => api.get(`/hospital/doctors/${doctorId}`);
export const updateDoctor = (doctorId, data) => api.put(`/hospital/doctors/${doctorId}`, data);
export const deleteDoctor = (doctorId) => api.delete(`/hospital/doctors/${doctorId}`);
export const toggleDoctorVerification = (doctorId, status) => api.patch(`/hospital/doctors/${doctorId}/verify`, { status });
export const getHospitalProfile = () => api.get('/hospital/me');

// Reminders
export const createReminder = (data) => api.post('/reminders', data);
export const getReminders = (params) => api.get('/reminders', { params });
export const getUpcomingReminders = (days) => api.get(`/reminders/upcoming?days=${days}`);
export const getReminderStats = () => api.get('/reminders/stats');
export const getReminder = (id) => api.get(`/reminders/${id}`);
export const updateReminder = (id, data) => api.put(`/reminders/${id}`, data);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);
export const completeReminder = (id) => api.patch(`/reminders/${id}/complete`);
export const dismissReminder = (id) => api.patch(`/reminders/${id}/dismiss`);

// Documents
export const uploadDocument = (formData) => api.post('/documents/ai/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadDocumentForPatient = (formData) => api.post('/documents/ai/upload-for-patient', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getDocuments = () => api.get('/documents');
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// AI Chat
export const sendChatMessage = (message) => api.post('/chat', { question: message });

// Health Tracking
export const addBPReading = (data) => api.post('/user/BP/BPReadings', data);
export const getBPReadings = () => api.get('/user/BP');
export const addSugarReading = (data) => api.post('/user/Sugar/SugarReadings', data);
export const getSugarReadings = () => api.get('/user/Sugar');

// Access Control
export const requestAccess = (data) => api.post('/access/request', data);
export const getAccessRequests = () => api.get('/access/list');
export const approveAccess = (data) => api.post('/access/approve', data);
export const revokeAccess = (data) => api.post('/access/revoke', data);
export const generateAccessToken = (data) => api.post('/access/generate', data);
export const claimAccess = (data) => api.post('/access/claim', data);
export const listAccesses = () => api.get('/access/list');
export const grantAccessByPhone = (data) => api.post('/access/grant-by-phone', data);
export const getActivityLogs = (limit = 100) => api.get(`/access/activity-logs?limit=${limit}`);
export const approveDoctorRequest = (requestId, otp) => api.post('/access/approve-doctor-request', { requestId, otp });
export const getPendingRequests = () => api.get('/access/pending-requests');

// Pharmacies
export const findNearbyPharmacies = (params) => api.get('/pharmacy/nearby', { params });
export const searchMedicine = (name) => api.get(`/medicine/search?name=${name}`);

// Pharmacy Management
export const getPharmacyStock = (params) => api.get('/pharmacy/stock', { params });
export const searchPharmacyStock = (query) => api.get('/pharmacy/stock/search', { params: { q: query } });
export const getLowStock = () => api.get('/pharmacy/stock/low');
export const getExpiryAlert = () => api.get('/pharmacy/stock/expiry');
export const addMedicine = (data) => api.post('/pharmacy/stock', data);
export const updateStock = (id, data) => api.patch(`/pharmacy/stock/${id}`, data);
export const deleteStock = (id) => api.delete(`/pharmacy/stock/${id}`);
export const getPharmacyProfile = () => api.get('/pharmacy/profile');
export const updatePharmacyProfile = (data) => api.patch('/pharmacy/profile', data);

// Form Entries
export const createFormEntry = (data) => api.post('/form-entry/create', data);
export const getFormEntries = (patientId) => api.get(`/form-entry/list/${patientId}`);
export const getFormEntry = (id) => api.get(`/form-entry/${id}`);
export const updateFormEntry = (id, data) => api.put(`/form-entry/${id}`, data);
export const deleteFormEntry = (id) => api.delete(`/form-entry/${id}`);

// Doctor Access to Patient Records
export const getPatientRecords = (patientId) => api.get(`/doctor-access/patient/${patientId}/records`);
export const requestAccessToPatient = (data) => api.post('/doctor-access/request-access', data);
export const updatePatientRecord = (patientId, updateData) => api.patch(`/doctor-access/patient/${patientId}/update`, updateData);

export default api;
