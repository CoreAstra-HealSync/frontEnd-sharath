import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { grantAccessByPhone } from '../../services/apiService';
import { FiPhone, FiClock, FiShield, FiSend, FiInfo } from 'react-icons/fi';
import '../Dashboard.css';

const GrantAccessByPhone = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    doctorPhone: '',
    accessType: 'view',
    expiryDuration: '7days'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctorPhone) {
      toast.error('Please enter doctor\'s phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(formData.doctorPhone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await grantAccessByPhone(formData);
      const { doctorName, shortCode } = response.data.data;
      
      toast.success(
        `✓ Access granted to ${doctorName}! Share code: ${shortCode}`,
        { autoClose: 5000 }
      );
      
      setTimeout(() => {
        navigate('/patient/access');
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to grant access';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <h1>
            <FiPhone style={{ verticalAlign: 'middle' }} /> Grant Access by Phone
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Grant a doctor access to your medical records using their phone number
          </p>
        </div>

        <div className="page-section">
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Info Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <h3 style={{ margin: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiInfo /> Quick Access Grant
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.95 }}>
                Know your doctor's phone number? Grant them access instantly without scanning QR codes!
              </p>
            </div>

            {/* Doctor Phone */}
            <div className="form-group">
              <label>
                <FiPhone style={{ verticalAlign: 'middle' }} /> Doctor's Phone Number *
              </label>
              <input
                type="tel"
                name="doctorPhone"
                value={formData.doctorPhone}
                onChange={handleChange}
                placeholder="+1234567890 or 1234567890"
                required
                className="form-input"
                style={{ fontSize: '1.1rem' }}
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                💡 Enter the phone number registered by your doctor
              </small>
            </div>

            {/* Access Type */}
            <div className="form-group">
              <label>
                <FiShield style={{ verticalAlign: 'middle' }} /> Permission Level *
              </label>
              <select
                name="accessType"
                value={formData.accessType}
                onChange={handleChange}
                className="form-input"
                required
                disabled
              >
                <option value="view">👁️ View & Upload - Doctor can view records and upload new data</option>
              </select>
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                Doctors can view your records and upload new forms/documents, but cannot edit existing data
              </small>
            </div>

            {/* Expiry Duration */}
            <div className="form-group">
              <label>
                <FiClock style={{ verticalAlign: 'middle' }} /> Access Duration *
              </label>
              <select
                name="expiryDuration"
                value={formData.expiryDuration}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="1hour">1 Hour - Emergency consultation</option>
                <option value="6hours">6 Hours - Short term</option>
                <option value="12hours">12 Hours - Half day</option>
                <option value="24hours">24 Hours - One day</option>
                <option value="3days">3 Days - Follow-up period</option>
                <option value="7days">7 Days (Recommended)</option>
                <option value="30days">30 Days - Monthly treatment</option>
                <option value="until_revoked">♾️ Until Revoked - Permanent doctor</option>
              </select>
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                Access will expire automatically after this duration
              </small>
            </div>

            {/* Access Summary */}
            <div style={{
              background: '#f0f9ff',
              border: '2px solid #0ea5e9',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ margin: 0, marginBottom: '0.75rem', color: '#0c4a6e', fontSize: '1rem' }}>
                📋 Access Summary
              </h4>
              <div style={{ fontSize: '0.9rem', color: '#0c4a6e', lineHeight: '1.8' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Doctor Phone:</strong> {formData.doctorPhone || 'Not entered'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Permission:</strong> 👁️ View & Upload
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Duration:</strong> {
                    formData.expiryDuration === 'until_revoked' ? '♾️ Until Revoked' :
                    formData.expiryDuration.replace('hour', ' Hour').replace('hours', ' Hours').replace('days', ' Days')
                  }
                </p>
              </div>
            </div>

            {/* How it Works */}
            <div style={{
              background: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: '600', color: '#92400e' }}>
                🔄 How it works:
              </p>
              <ol style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#92400e', lineHeight: '1.6' }}>
                <li>You submit this form with doctor's phone number</li>
                <li>System finds the doctor and creates access token</li>
                <li>You receive a short code to share with doctor</li>
                <li>Doctor can immediately access your records</li>
                <li>Access expires automatically based on your settings</li>
              </ol>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/patient/access')}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    Granting Access...
                  </>
                ) : (
                  <>
                    <FiSend /> Grant Access
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GrantAccessByPhone;
