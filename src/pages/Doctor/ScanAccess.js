import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { claimAccess } from '../../services/apiService';
import { FiCamera, FiHash, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const ScanAccess = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('shortcode'); // 'shortcode' or 'token'
  const [shortCode, setShortCode] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClaim = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = method === 'shortcode' 
        ? { shortCode: shortCode.trim() } 
        : { token: token.trim() };
      
      const response = await claimAccess(payload);
      const access = response.data.data;
      
      toast.success(`✓ Access granted! You now have ${access.accessType} access.`);
      
      // Redirect to patients page after successful claim
      setTimeout(() => {
        navigate('/doctor/patients');
      }, 1500);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to claim access';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="doctor" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiCamera /> Scan Patient Access</h1>
          <p>Enter short code or token to access patient records</p>
        </div>

        <div className="page-section">
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {/* Method Selection */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                className={`btn ${method === 'shortcode' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMethod('shortcode')}
                style={{ flex: 1 }}
              >
                <FiHash /> Short Code
              </button>
              <button
                className={`btn ${method === 'token' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMethod('token')}
                style={{ flex: 1 }}
              >
                <FiCheckCircle /> Full Token
              </button>
            </div>

            <form onSubmit={handleClaim}>
              {method === 'shortcode' ? (
                <>
                  <div className="form-group">
                    <label style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'block' }}>
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123456"
                      value={shortCode}
                      onChange={(e) => setShortCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength="6"
                      pattern="[0-9]{6}"
                      required
                      style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        letterSpacing: '0.5rem',
                        fontFamily: 'monospace'
                      }}
                    />
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.5rem',
                      textAlign: 'center'
                    }}>
                      Ask the patient for their 6-digit access code
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'block' }}>
                      Enter Full Access Token
                    </label>
                    <textarea
                      className="form-input"
                      placeholder="Paste the full token from QR scan..."
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      rows="4"
                      required
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                      }}
                    />
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.5rem',
                      textAlign: 'center'
                    }}>
                      If you scanned a QR code, paste the token here
                    </p>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginTop: '1rem'
                }}
              >
                {loading ? '⏳ Claiming Access...' : '✓ Claim Access'}
              </button>
            </form>

            {/* Instructions */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: '#e0f7fa',
              borderRadius: '8px',
              color: '#006064'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                📱 How to Access Patient Records:
              </h3>
              <ol style={{ marginLeft: '1.5rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li>Ask the patient to generate an access code from their app</li>
                <li>Patient will show you a <strong>6-digit code</strong> or <strong>QR code</strong></li>
                <li>Enter the 6-digit code above, or scan QR to get the token</li>
                <li>Click "Claim Access" to get permission</li>
                <li>You'll be granted access based on patient's settings (view/edit/full)</li>
                <li>Access will expire automatically per patient's configuration</li>
              </ol>
            </div>

            {/* QR Scanner Note */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#fff3cd',
              borderRadius: '8px',
              color: '#856404',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              <strong>💡 Pro Tip:</strong> If you have a QR scanner app, scan the patient's QR code and it will give you a link. 
              Open that link in your browser, then copy the token from the URL and paste it above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanAccess;
