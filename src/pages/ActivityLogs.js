import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import { getActivityLogs, approveDoctorRequest } from '../services/apiService';
import { 
  FiClock, 
  FiUser
} from 'react-icons/fi';
import './Dashboard.css';

const ActivityLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [otp, setOtp] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const response = await getActivityLogs(100);
      setLogs(response.data.data.logs || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load activity logs';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setApproving(true);
    try {
      await approveDoctorRequest(pendingApproval, otp);
      toast.success('Access approved successfully!');
      setPendingApproval(null);
      setOtp('');
      fetchActivityLogs();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to approve access';
      toast.error(errorMsg);
    } finally {
      setApproving(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      access_granted: '✅',
      view_dashboard: '👁️',
      view_documents: '📄',
      view_document: '📄',
      view_health_forms: '📋',
      view_form: '📋',
      view_vitals: '💓',
      edit_form: '✏️',
      create_form: '➕',
      delete_form: '🗑️',
      edit_profile: '👤',
      access_revoked: '❌'
    };
    return icons[action] || '📌';
  };

  const getActionLabel = (action) => {
    const labels = {
      access_granted: 'Access Granted',
      view_dashboard: 'Viewed Dashboard',
      view_documents: 'Viewed Documents',
      view_document: 'Viewed Document',
      view_health_forms: 'Viewed Health Forms',
      view_form: 'Viewed Health Form',
      view_vitals: 'Viewed Vitals',
      edit_form: 'Edited Health Form',
      create_form: 'Created Health Form',
      delete_form: 'Deleted Health Form',
      edit_profile: 'Edited Profile',
      access_revoked: 'Access Revoked'
    };
    return labels[action] || action;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="patient" />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading activity logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>📊 Access Activity Logs</h1>
          <p>Track what doctors have accessed and modified in your medical records</p>
        </div>

        {/* Approval Modal */}
        {pendingApproval && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2>🔐 Approve Doctor Access</h2>
              </div>
              
              <div className="modal-form">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Enter the 6-digit OTP sent to your phone/email
                </p>
                
                <div className="form-group">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="form-input"
                    style={{ 
                      fontSize: '1.5rem', 
                      textAlign: 'center', 
                      letterSpacing: '0.5rem',
                      fontWeight: '600'
                    }}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setPendingApproval(null);
                      setOtp('');
                    }}
                    disabled={approving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleApproveRequest}
                    disabled={approving || otp.length !== 6}
                  >
                    {approving ? '⏳ Approving...' : '✓ Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="page-section">
          {logs.length > 0 ? (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {logs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    fontSize: '2rem',
                    flexShrink: 0,
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-teal) 100%)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: '0.75rem',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          color: 'var(--text-primary)', 
                          margin: '0 0 0.5rem 0',
                          fontSize: '1.1rem',
                          fontWeight: '600'
                        }}>
                          {getActionLabel(log.action)}
                        </h4>
                        <p style={{ 
                          margin: 0, 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FiUser /> Dr. {log.doctorId?.name || 'Unknown Doctor'}
                          </span>
                          {log.doctorId?.specialization && (
                            <span style={{ 
                              fontSize: '0.85rem',
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(79, 70, 229, 0.1)',
                              color: 'var(--primary-blue)',
                              borderRadius: '6px',
                              fontWeight: '500'
                            }}>
                              {log.doctorId.specialization}
                            </span>
                          )}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.375rem 0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        whiteSpace: 'nowrap'
                      }}>
                        <FiClock /> {formatDate(log.timestamp)}
                      </span>
                    </div>

                    {/* Details */}
                    {log.details && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        border: '1px solid var(--border-color)'
                      }}>
                        {log.details.method && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Method:</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>{log.details.method}</span>
                          </div>
                        )}
                        {log.details.resourceType && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Resource:</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>{log.details.resourceType}</span>
                          </div>
                        )}
                        {log.details.changesMade && (
                          <div style={{ marginTop: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                              Changes Made:
                            </strong>
                            <pre style={{ 
                              margin: 0,
                              padding: '0.75rem',
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              overflow: 'auto',
                              maxHeight: '200px',
                              color: 'var(--text-primary)'
                            }}>
                              {JSON.stringify(log.details.changesMade, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>No Activity Yet</h3>
              <p>No doctors have accessed your medical records yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
