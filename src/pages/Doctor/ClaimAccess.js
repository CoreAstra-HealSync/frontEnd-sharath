import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { claimAccess } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import '../Dashboard.css';

const ClaimAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [tokenFromUrl, setTokenFromUrl] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setTokenFromUrl(token);
      
      // Check if doctor is authenticated - use a slight delay to ensure storage is ready
      setTimeout(() => {
        const doctorToken = localStorage.getItem('doctorToken');
        const role = localStorage.getItem('healsync-role');
        
        console.log('ClaimAccess - Auth check:', { hasDoctorToken: !!doctorToken, role, token: token.substring(0, 20) });
        
        if (doctorToken && role === 'doctor') {
          console.log('ClaimAccess - Doctor authenticated, auto-claiming...');
          handleAutoClaim(token);
        } else {
          console.log('ClaimAccess - Not authenticated, storing pendingClaimToken');
        }
      }, 100);
    } else {
      toast.error('No access token found in URL');
      navigate('/doctor/login');
    }
  }, [searchParams]);

  const handleAutoClaim = async (token) => {
    setClaiming(true);
    setLoading(true);

    try {
      const response = await claimAccess({ token });
      const access = response.data.data;
      
      toast.success(`✓ Access granted! You now have ${access.accessType} access to the patient's records.`);
      
      setTimeout(() => {
        navigate('/doctor/patients');
      }, 2000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to claim access';
      toast.error(errorMsg);
      setClaiming(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualClaim = async () => {
    if (!tokenFromUrl) {
      toast.error('No token available');
      return;
    }
    
    handleAutoClaim(tokenFromUrl);
  };

  // If not authenticated, show login prompt
  const doctorToken = localStorage.getItem('doctorToken');
  const role = localStorage.getItem('healsync-role');
  const isDoctorAuthenticated = doctorToken && role === 'doctor';
  
  if (!isDoctorAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ maxWidth: '500px' }}>
          <div className="auth-header">
            <div className="auth-logo">🔐</div>
            <h1 className="auth-title">Doctor Login Required</h1>
            <p className="auth-subtitle">Please login to claim patient access</p>
          </div>

          <div style={{
            background: '#e3f2fd',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '2px solid #2196f3'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <FiCheckCircle style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Access Token Detected
            </h3>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              A patient has shared their medical records with you. To view these records, you need to login with your doctor credentials.
            </p>
            <div style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              wordBreak: 'break-all',
              color: '#666'
            }}>
              Token: {tokenFromUrl.substring(0, 20)}...
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '1rem' }}
            onClick={() => {
              // Store token in sessionStorage to claim after login
              sessionStorage.setItem('pendingClaimToken', tokenFromUrl);
              navigate('/doctor/login', { state: { returnUrl: `/doctor/claim-access?token=${tokenFromUrl}` } });
            }}
          >
            🔐 Login as Doctor
          </button>

          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
            Don't have an account? <a href="/doctor/register" style={{ color: '#667eea', fontWeight: '600' }}>Register here</a>
          </p>
        </div>
      </div>
    );
  }

  // If authenticated but claiming
  if (claiming) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '2rem auto' }}></div>
          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem' }}>Claiming Access...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please wait while we process your access request</p>
        </div>
      </div>
    );
  }

  // If authenticated but not auto-claimed (shouldn't happen)
  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-logo">✓</div>
          <h1 className="auth-title">Claim Patient Access</h1>
          <p className="auth-subtitle">You're logged in as a doctor</p>
        </div>

        <div style={{
          background: '#fff3cd',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '2px solid #ffc107'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '0.5rem', fontSize: '1rem' }}>
            <FiAlertCircle style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Manual Claim Required
          </h3>
          <p style={{ color: '#856404', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Click the button below to manually claim access to the patient's records.
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          onClick={handleManualClaim}
          disabled={loading}
        >
          {loading ? '⏳ Claiming...' : '✓ Claim Access Now'}
        </button>
      </div>
    </div>
  );
};

export default ClaimAccess;
