import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { generateAccessToken, listAccesses, revokeAccess } from '../../services/apiService';
import QRCode from 'qrcode.react';
import { FiShield, FiPlus, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const AccessControl = () => {
  const navigate = useNavigate();
  const [accesses, setAccesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [formData, setFormData] = useState({ 
    accessType: 'view',
    expiryDuration: '24hours'
  });

  useEffect(() => {
    fetchAccesses();
  }, []);

  const fetchAccesses = async () => {
    try {
      const response = await listAccesses();
      setAccesses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching accesses:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      const response = await generateAccessToken(formData);
      setGeneratedToken(response.data.data);
      toast.success('Access token generated!');
      setShowModal(false);
      fetchAccesses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate token');
    }
  };

  const handleRevoke = async (accessId) => {
    if (window.confirm('Are you sure you want to revoke this access? The doctor will immediately lose access to your medical records.')) {
      try {
        await revokeAccess({ accessId });
        toast.success('Access revoked successfully');
        fetchAccesses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to revoke access');
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiShield /> Access Control</h1>
          <p>Share your medical records securely with QR codes</p>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Generate Access Token</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/patient/grant-access-by-phone')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiPhone /> Grant by Phone
              </button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <FiPlus /> New Token
              </button>
            </div>
          </div>

          {generatedToken && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '2px solid var(--bright-teal-blue)'
            }}>
              <h3 style={{color: 'var(--bright-teal-blue)', marginBottom: '1rem'}}>🎫 Access Token Generated</h3>
              
              {/* QR Code */}
              <div style={{
                display: 'inline-block',
                padding: '1.5rem',
                background: '#fff',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                {generatedToken.qrDataUrl ? (
                  <img src={generatedToken.qrDataUrl} alt="QR Code" style={{width: '250px', height: '250px'}} />
                ) : (
                  <QRCode value={generatedToken.url || generatedToken.token} size={250} />
                )}
              </div>

              {/* Token Details */}
              <div style={{
                background: 'var(--bg-primary)',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'left',
                marginBottom: '1rem'
              }}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                  <div>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Short Code</p>
                    <p style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--bright-teal-blue)', fontFamily: 'monospace'}}>{generatedToken.shortCode}</p>
                  </div>
                  <div>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Permission Type</p>
                    <p style={{fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase'}}>
                      👁️ View / 📤 Upload
                    </p>
                  </div>
                  <div>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Valid Duration</p>
                    <p style={{fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)'}}>
                      {generatedToken.expiryDuration === 'until_revoked' ? '♾️ Until Revoked' : generatedToken.expiryDuration.replace('hours', 'h').replace('days', 'd')}\n                    </p>
                  </div>
                  {generatedToken.expiresAt && (
                    <div>
                      <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Expires At</p>
                      <p style={{fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)'}}>
                        {new Date(generatedToken.expiresAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div style={{
                background: '#e0f7fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'left',
                color: '#006064'
              }}>
                <p style={{fontWeight: '600', marginBottom: '0.5rem'}}>📱 Instructions for Doctor:</p>
                <ol style={{marginLeft: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6'}}>
                  <li>Scan this QR code with your phone camera or QR scanner app</li>
                  <li>The link will open showing your basic information</li>
                  <li>Click "Claim Access" and login as a doctor</li>
                  <li>You'll get <strong>{generatedToken.accessType}</strong> access to your medical records</li>
                  <li>Access expires: <strong>{generatedToken.expiryDuration === 'until_revoked' ? 'Until you revoke it' : generatedToken.expiryDuration}</strong></li>
                </ol>
              </div>

              {/* Actions */}
              <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { 
                    navigator.clipboard.writeText(generatedToken.shortCode); 
                    toast.success('Short code copied!'); 
                  }}
                >
                  📋 Copy Code
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { 
                    navigator.clipboard.writeText(generatedToken.url); 
                    toast.success('Link copied!'); 
                  }}
                >
                  🔗 Copy Link
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setGeneratedToken(null)}
                >
                  ✓ Done
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Active Accesses</h2>
          </div>
          {accesses.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {accesses.map((access) => (
                <div key={access._id} style={{
                  padding: '1.25rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${access.isActive ? 'var(--bright-teal-blue)' : '#999'}`
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
                        <h4 style={{color: 'var(--text-primary)', margin: 0}}>
                          {access.doctorId?.name || 'Doctor Access'}
                        </h4>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: '#e0f7fa',
                          color: '#006064'
                        }}>
                          👁️ View / 📤 Upload
                        </span>
                        {access.isActive && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: '#dcfce7',
                            color: '#166534'
                          }}>
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0'}}>
                        Duration: <strong>{access.expiryDuration?.replace('hours', 'h').replace('days', 'd') || 'N/A'}</strong>
                      </p>
                      {access.expiresAt ? (
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0'}}>
                          Expires: {new Date(access.expiresAt).toLocaleString()}
                        </p>
                      ) : (
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0'}}>
                          ♾️ Valid until revoked
                        </p>
                      )}
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.25rem 0'}}>
                        Granted: {new Date(access.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleRevoke(access._id)}
                      style={{minWidth: '100px'}}
                    >
                      🗑️ Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔒</div>
              <h3>No active accesses</h3>
              <p>Generate a token to share your medical records</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Generate Access Token</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div style={{padding: '1.5rem'}}>
                <div className="form-group">
                  <label>Permission Type *</label>
                  <select
                    className="form-input"
                    value={formData.accessType}
                    onChange={(e) => setFormData({...formData, accessType: e.target.value})}
                    required
                    disabled
                  >
                    <option value="view">👁️ View + 📤 Upload - Doctor can view records and upload new data</option>
                  </select>
                  <small style={{color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block'}}>
                    Doctors can view your medical records and upload new forms/documents, but cannot edit existing data.
                  </small>
                </div>

                <div className="form-group">
                  <label>Access Duration *</label>
                  <select
                    className="form-input"
                    value={formData.expiryDuration}
                    onChange={(e) => setFormData({...formData, expiryDuration: e.target.value})}
                    required
                  >
                    <option value="1hour">1 Hour - Emergency consultation</option>
                    <option value="6hours">6 Hours - Short term access</option>
                    <option value="12hours">12 Hours - Half day access</option>
                    <option value="24hours">24 Hours (Recommended)</option>
                    <option value="3days">3 Days - Extended consultation</option>
                    <option value="7days">1 Week - Treatment period</option>
                    <option value="30days">1 Month - Long term care</option>
                    <option value="until_revoked">♾️ Until Revoked - Permanent doctor</option>
                  </select>
                </div>

                <div style={{
                  background: '#fff3cd',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  color: '#856404'
                }}>
                  <strong>⚠️ Security Note:</strong>
                  <ul style={{marginLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.6'}}>
                    <li><strong>View + Upload Access</strong>: Doctor can view your records and upload new medical data (cannot edit or delete existing records)</li>
                    <li><strong>No Editing</strong>: Doctors cannot modify or delete existing records</li>
                    <li><strong>Your Control</strong>: You can revoke access anytime</li>
                  </ul>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleGenerate}>🎫 Generate Token</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessControl;
