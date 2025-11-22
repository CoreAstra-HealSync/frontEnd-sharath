import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getUpcomingReminders, getReminderStats } from '../../services/apiService';
import { FiBell, FiFile, FiActivity, FiCalendar } from 'react-icons/fi';
import '../Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, remindersRes] = await Promise.all([
        getReminderStats(),
        getUpcomingReminders(7)
      ]);
      setStats(statsRes.data.data);
      setUpcomingReminders(remindersRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name || 'Patient'}!</h1>
          <p>Here's your health overview</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, var(--bright-teal-blue), var(--turquoise-surf))'}}>
                <FiBell />
              </div>
            </div>
            <div className="stat-value">{stats.total || 0}</div>
            <div className="stat-label">Total Reminders</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #f093fb, #f5576c)'}}>
                <FiCalendar />
              </div>
            </div>
            <div className="stat-value">{stats.pending || 0}</div>
            <div className="stat-label">Pending Reminders</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}}>
                <FiActivity />
              </div>
            </div>
            <div className="stat-value">{stats.completed || 0}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #11998e, #38ef7d)'}}>
                <FiFile />
              </div>
            </div>
            <div className="stat-value">-</div>
            <div className="stat-label">Medical Documents</div>
          </div>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Reminders</h2>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : upcomingReminders.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {upcomingReminders.map((reminder) => (
                <div key={reminder._id} style={{
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--bright-teal-blue)'
                }}>
                  <h4 style={{color: 'var(--text-primary)', marginBottom: '0.5rem'}}>{reminder.title}</h4>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                    {new Date(reminder.reminderDateTime).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No upcoming reminders</h3>
              <p>Create a reminder to get started</p>
            </div>
          )}
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            <button className="btn btn-primary" onClick={() => window.location.href = '/patient/reminders'}>
              <FiBell /> New Reminder
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/patient/documents'}>
              <FiFile /> Upload Document
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/patient/chat'}>
              🤖 AI Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
