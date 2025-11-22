import React from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../Dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <Sidebar role="doctor" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, Dr. {user?.name || 'Doctor'}!</h1>
          <p>Your medical practice dashboard</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}}>
                <FiUsers />
              </div>
            </div>
            <div className="stat-value">-</div>
            <div className="stat-label">Total Patients</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, var(--bright-teal-blue), var(--turquoise-surf))'}}>
                <FiCalendar />
              </div>
            </div>
            <div className="stat-value">-</div>
            <div className="stat-label">Appointments Today</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #f093fb, #f5576c)'}}>
                <FiFileText />
              </div>
            </div>
            <div className="stat-value">-</div>
            <div className="stat-label">Records Reviewed</div>
          </div>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            <button className="btn btn-primary" onClick={() => navigate('/doctor/patients')}>
              <FiUsers /> View Patients
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/doctor/appointments')}>
              <FiCalendar /> Schedule Appointment
            </button>
            <button className="btn btn-secondary" onClick={() => {
              // Navigate to patients page where doctor can select a patient to create report
              navigate('/doctor/patients');
              toast.info('📋 Select a patient to create a report');
            }}>
              <FiFileText /> Create Report
            </button>
          </div>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No recent activity</h3>
            <p>Your recent patient interactions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
