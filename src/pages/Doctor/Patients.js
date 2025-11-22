import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiUsers, FiSearch, FiEye, FiEdit, FiUnlock, FiClock, FiGrid } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { listAccesses } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const Patients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [accesses, setAccesses] = useState([]);
  const [filteredAccesses, setFilteredAccesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccessList();
    
    // Auto-refresh every 30 seconds to detect revoked access
    const interval = setInterval(() => {
      fetchAccessList();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter accesses based on search term
    if (searchTerm.trim()) {
      const filtered = accesses.filter(access =>
        access.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        access.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAccesses(filtered);
    } else {
      setFilteredAccesses(accesses);
    }
  }, [searchTerm, accesses]);

  const fetchAccessList = async () => {
    setLoading(true);
    try {
      const response = await listAccesses();
      console.log('Raw access list response:', response.data);
      
      // Filter only active and non-expired accesses for doctor
      const now = new Date();
      const activeAccesses = (response.data.data || []).filter(access => {
        const isActiveAccess = access.isActive === true;
        const notExpired = !access.expiresAt || new Date(access.expiresAt) > now;
        console.log(`Access for ${access.patientId?.name}: isActive=${access.isActive}, granted=${isActiveAccess}, notExpired=${notExpired}`);
        return isActiveAccess && notExpired;
      });
      
      console.log('Active accesses after filter:', activeAccesses);
      setAccesses(activeAccesses);
      setFilteredAccesses(activeAccesses);
    } catch (error) {
      console.error('Error fetching accesses:', error);
      toast.error('Failed to load patient list');
    } finally {
      setLoading(false);
    }
  };

  const getAccessIcon = (accessType) => {
    switch (accessType) {
      case 'view': return <FiEye />;
      case 'edit': return <FiEdit />;
      case 'full': return <FiUnlock />;
      default: return <FiEye />;
    }
  };

  const getAccessColor = (accessType) => {
    switch (accessType) {
      case 'view': return { bg: '#e0f7fa', text: '#006064' };
      case 'edit': return { bg: '#fef3c7', text: '#92400e' };
      case 'full': return { bg: '#fee', text: '#c00' };
      default: return { bg: '#e0e7ff', text: '#3730a3' };
    }
  };

  const getExpiryStatus = (expiresAt) => {
    if (!expiresAt) return { text: '♾️ No Expiry', color: '#166534', bg: '#dcfce7' };
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const hoursLeft = Math.floor((expiry - now) / (1000 * 60 * 60));
    
    if (hoursLeft < 0) return { text: '❌ Expired', color: '#991b1b', bg: '#fee2e2' };
    if (hoursLeft < 2) return { text: `⚠️ ${hoursLeft}h left`, color: '#92400e', bg: '#fef3c7' };
    if (hoursLeft < 24) return { text: `${hoursLeft}h left`, color: '#065f46', bg: '#d1fae5' };
    
    const daysLeft = Math.floor(hoursLeft / 24);
    return { text: `${daysLeft}d left`, color: '#065f46', bg: '#d1fae5' };
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="doctor" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiUsers /> My Patients</h1>
          <p>View and manage patients you have access to</p>
        </div>

        <div className="page-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
            <div style={{flex: 1, minWidth: '250px', display: 'flex', gap: '0.5rem'}}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{flex: 1}}
              />
              <button 
                className="btn btn-secondary"
                onClick={fetchAccessList}
                title="Refresh patient list"
                style={{minWidth: '100px'}}
              >
                🔄 Refresh
              </button>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/doctor/scan-access')}
            >
              <FiGrid /> Scan QR / Enter Code
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/doctor/request-access')}
            >
              📲 Request Access
            </button>
          </div>

          {loading ? (
            <div style={{textAlign: 'center', padding: '3rem'}}>
              <div className="spinner" style={{margin: '0 auto'}}></div>
              <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>Loading patients...</p>
            </div>
          ) : filteredAccesses.length > 0 ? (
            <div style={{display: 'grid', gap: '1rem'}}>
              {filteredAccesses.map((access) => {
                const accessColor = getAccessColor(access.accessType);
                const expiryStatus = getExpiryStatus(access.expiresAt);
                
                return (
                  <div key={access._id} style={{
                    padding: '1.5rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap'}}>
                      <div style={{flex: 1, minWidth: '200px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap'}}>
                          <h3 style={{color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem'}}>
                            {access.patientId?.name || 'Unknown Patient'}
                          </h3>
                          
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: accessColor.bg,
                            color: accessColor.text
                          }}>
                            {getAccessIcon(access.accessType)}
                            👁️ VIEW
                          </span>
                          
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: '#dcfce7',
                            color: '#166534'
                          }}>
                            📤 UPLOAD
                          </span>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: expiryStatus.bg,
                            color: expiryStatus.color
                          }}>
                            <FiClock />
                            {expiryStatus.text}
                          </span>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                          {access.patientId?.email && (
                            <p style={{margin: 0}}>
                              📧 {access.patientId.email}
                            </p>
                          )}
                          {access.patientId?.phone_no && (
                            <p style={{margin: 0}}>
                              📞 {access.patientId.phone_no}
                            </p>
                          )}
                          <p style={{margin: 0}}>
                            🗓️ Granted: {new Date(access.createdAt).toLocaleDateString()} at {new Date(access.createdAt).toLocaleTimeString()}
                          </p>
                          {access.expiresAt && (
                            <p style={{margin: 0}}>
                              ⏰ Expires: {new Date(access.expiresAt).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          background: 'var(--bg-primary)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)'
                        }}>
                          <strong>Permissions:</strong>
                          <ul style={{margin: '0.5rem 0 0 1.5rem', lineHeight: '1.6'}}>
                            <li>✓ View medical records</li>
                            <li>✓ Upload new forms/documents</li>
                            <li>❌ Cannot edit existing records</li>
                          </ul>
                        </div>
                      </div>

                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px'}}>
                        <button 
                          className="btn btn-primary"
                          style={{width: '100%'}}
                          onClick={() => navigate(`/doctor/patient/${access.patientId._id}/records`)}
                        >
                          📋 View Records
                        </button>
                        
                        <button 
                          className="btn btn-secondary"
                          style={{width: '100%'}}
                          onClick={() => navigate(`/doctor/patient/${access.patientId._id}/records`)}
                        >
                          ➕ Upload Data
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No Patient Access Yet</h3>
              <p>Scan a patient's QR code or enter their access code to view their medical records</p>
              <button 
                className="btn btn-primary"
                style={{marginTop: '1rem'}}
                onClick={() => navigate('/doctor/scan-access')}
              >
                <FiGrid /> Scan QR / Enter Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;
