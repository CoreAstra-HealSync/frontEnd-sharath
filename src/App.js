import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Auth Pages
import Landing from './pages/Landing/Landing';
import PatientLogin from './pages/Auth/PatientLogin';
import PatientRegister from './pages/Auth/PatientRegister';
import DoctorLogin from './pages/Auth/DoctorLogin';
import DoctorRegister from './pages/Auth/DoctorRegister';
import PharmacyLogin from './pages/Auth/PharmacyLogin';
import PharmacyRegister from './pages/Auth/PharmacyRegister';
import PharmacyForgotPassword from './pages/Auth/PharmacyForgotPassword';
import PharmacyResetPassword from './pages/Auth/PharmacyResetPassword';
import HospitalLogin from './pages/Auth/HospitalLogin';
import HospitalRegister from './pages/Auth/HospitalRegister';
import ForgotPassword from './pages/Auth/ForgotPassword';
import PatientResetPassword from './pages/Auth/PatientResetPassword';
import DoctorForgotPassword from './pages/Auth/DoctorForgotPassword';
import DoctorResetPassword from './pages/Auth/DoctorResetPassword';
import HospitalForgotPassword from './pages/Auth/HospitalForgotPassword';
import HospitalResetPassword from './pages/Auth/HospitalResetPassword';

// Patient Dashboard
import PatientDashboard from './pages/Patient/Dashboard';
import Reminders from './pages/Patient/Reminders';
import Documents from './pages/Patient/Documents';
import AIChat from './pages/Patient/AIChat';
import HealthTracking from './pages/Patient/HealthTracking';
import AccessControl from './pages/Patient/AccessControl';
import Pharmacies from './pages/Patient/Pharmacies';
import HealthForms from './pages/Patient/HealthForms';
import GrantAccessByPhone from './pages/Patient/GrantAccessByPhone';

// Doctor Dashboard
import DoctorDashboard from './pages/Doctor/Dashboard';
import Patients from './pages/Doctor/Patients';
import Appointments from './pages/Doctor/Appointments';
import ScanAccess from './pages/Doctor/ScanAccess';
import ClaimAccess from './pages/Doctor/ClaimAccess';
import PatientRecords from './pages/Doctor/PatientRecords';
import RequestAccessForm from './pages/Doctor/RequestAccessForm';
import EditPatientRecord from './pages/Doctor/EditPatientRecord';

// Patient Activity Logs
import ActivityLogs from './pages/ActivityLogs';

// Pharmacy Dashboard
import PharmacyDashboard from './pages/Pharmacy/Dashboard';
import Inventory from './pages/Pharmacy/Inventory';
import PharmacyProfile from './pages/Pharmacy/Profile';

// Hospital Dashboard
import HospitalDashboard from './pages/Hospital/Dashboard';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/patient/login" element={<PatientLogin />} />
                <Route path="/patient/register" element={<PatientRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<PatientResetPassword />} />
                
                <Route path="/doctor/login" element={<DoctorLogin />} />
                <Route path="/doctor/register" element={<DoctorRegister />} />
                <Route path="/doctor/forgot-password" element={<DoctorForgotPassword />} />
                <Route path="/doctor/reset-password/:token" element={<DoctorResetPassword />} />
                
                <Route path="/pharmacy/login" element={<PharmacyLogin />} />
                <Route path="/pharmacy/register" element={<PharmacyRegister />} />
                <Route path="/pharmacy/forgot-password" element={<PharmacyForgotPassword />} />
                <Route path="/pharmacy/reset-password/:token" element={<PharmacyResetPassword />} />
                
                <Route path="/hospital/login" element={<HospitalLogin />} />
                <Route path="/hospital/register" element={<HospitalRegister />} />
                <Route path="/hospital/forgot-password" element={<HospitalForgotPassword />} />
                <Route path="/hospital/reset-password/:token" element={<HospitalResetPassword />} />

                {/* Patient Protected Routes */}
                <Route path="/patient" element={<ProtectedRoute role="patient" />}>
                  <Route path="dashboard" element={<PatientDashboard />} />
                  <Route path="reminders" element={<Reminders />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="chat" element={<AIChat />} />
                  <Route path="health" element={<HealthTracking />} />
                  <Route path="health-forms" element={<HealthForms />} />
                  <Route path="access" element={<AccessControl />} />
                  <Route path="grant-access-by-phone" element={<GrantAccessByPhone />} />
                  <Route path="pharmacies" element={<Pharmacies />} />
                  <Route path="activity-logs" element={<ActivityLogs />} />
                </Route>

                {/* Doctor Protected Routes */}
                <Route path="/doctor" element={<ProtectedRoute role="doctor" />}>
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="scan-access" element={<ScanAccess />} />
                  <Route path="request-access" element={<RequestAccessForm />} />
                  <Route path="patient/:patientId/records" element={<PatientRecords />} />
                  <Route path="patient/:patientId/edit" element={<EditPatientRecord />} />
                </Route>

                {/* Doctor Claim Access - Special route (requires auth but redirects if not) */}
                <Route path="/doctor/claim-access" element={<ClaimAccess />} />

                {/* Pharmacy Protected Routes */}
                <Route path="/pharmacy" element={<ProtectedRoute role="pharmacy" />}>
                  <Route path="dashboard" element={<PharmacyDashboard />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="profile" element={<PharmacyProfile />} />
                </Route>

                {/* Hospital Protected Routes */}
                <Route path="/hospital" element={<ProtectedRoute role="hospital" />}>
                  <Route path="dashboard" element={<HospitalDashboard />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
