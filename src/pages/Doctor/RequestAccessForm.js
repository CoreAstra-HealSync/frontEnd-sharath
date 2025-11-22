import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { requestAccessToPatient, approveDoctorRequest } from '../../services/apiService';
import { FiPhone, FiClock, FiFileText, FiSend, FiKey, FiAlertCircle } from 'react-icons/fi';
import '../Dashboard.css';

const RequestAccessForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  
  const [formData, setFormData] = useState({
    patientPhone: '',
    accessType: 'view',
    reason: '',
    expiryDuration: '7d'
  });

  // Countdown timer for OTP
  React.useEffect(() => {
    if (otpSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientPhone || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await requestAccessToPatient({
        patientPhone: formData.patientPhone,
        accessType: formData.accessType,
        reason: formData.reason,
        expiryDuration: formData.expiryDuration
      });
      const { requestId, patientName: name, otpSentTo } = response.data.data;
      
      setRequestId(requestId);
      setPatientName(name);
      setOtpSent(true);
      setTimeLeft(600); // Reset timer
      
      toast.success(`OTP sent to ${name}'s WhatsApp (${otpSentTo}). Ask patient for the code.`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send access request';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      await approveDoctorRequest(requestId, otp);
      toast.success(`✓ Access granted! You can now view ${patientName}'s records.`);
      
      setTimeout(() => {
        navigate('/doctor/patients');
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid or expired OTP';
      toast.error(errorMsg);
      setOtp(''); // Clear OTP field
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="doctor" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>📲 Request Patient Access</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Request access to a patient's medical records. The patient will receive an OTP to approve your request.
          </p>
        </div>

        <div className="page-section">
          {!otpSent ? (
            // Step 1: Request Form
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* Patient Phone */}
              <div className="form-group">
                <label>
                  <FiPhone style={{ verticalAlign: 'middle' }} /> Patient Phone Number *
                </label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  required
                  className="form-control"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Enter the patient's registered phone number
                </small>
              </div>

              {/* Access Type */}
              <div className="form-group">
                <label>
                  🔐 Access Type *
                </label>
                <select
                  name="accessType"
                  value={formData.accessType}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled
                >
                  <option value="view">View & Upload - Can view records and upload new data</option>
                </select>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  You can view patient records and upload new forms/documents, but cannot edit existing data
                </small>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label>
                  <FiFileText style={{ verticalAlign: 'middle' }} /> Reason for Access *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Explain why you need access to this patient's records..."
                  required
                  rows={4}
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  This will be shown to the patient
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
                  className="form-control"
                  required
                >
                  <option value="1h">1 Hour</option>
                  <option value="6h">6 Hours</option>
                  <option value="1d">1 Day</option>
                  <option value="3d">3 Days</option>
                  <option value="7d">7 Days (Recommended)</option>
                  <option value="14d">14 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="until_revoked">Until Revoked</option>
                </select>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  How long should the access last?
                </small>
              </div>

              {/* Info Box */}
              <div style={{
                background: '#eff6ff',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #3b82f6'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
                  <strong>ℹ️ How it works:</strong>
                </p>
                <ol style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#1e40af' }}>
                  <li>You submit this request</li>
                  <li>Patient receives OTP via WhatsApp/SMS</li>
                  <li>Patient shares the OTP with you (phone/in-person)</li>
                  <li>You enter the OTP to gain access</li>
                </ol>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/doctor/patients')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <FiSend /> Send OTP to Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Step 2: OTP Verification
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* Success Message */}
              <div style={{
                background: '#dcfce7',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                borderLeft: '4px solid #16a34a',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✉️</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#15803d' }}>
                  OTP Sent to {patientName}
                </h3>
                <p style={{ margin: 0, color: '#166534', fontSize: '0.95rem' }}>
                  An OTP has been sent to the patient's registered WhatsApp/Phone.<br/>
                  Ask the patient for the 6-digit code to complete the access request.
                </p>
              </div>

              {/* Timer Warning */}
              {timeLeft > 0 ? (
                <div style={{
                  background: '#fef3c7',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  borderLeft: '4px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <FiClock style={{ fontSize: '1.5rem', color: '#d97706' }} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#92400e' }}>Time Remaining:</strong>
                    <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#b45309' }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#fee2e2',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  borderLeft: '4px solid #dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <FiAlertCircle style={{ fontSize: '1.5rem', color: '#dc2626' }} />
                  <div style={{ flex: 1, color: '#991b1b' }}>
                    <strong>OTP Expired!</strong> Please go back and request a new OTP.
                  </div>
                </div>
              )}

              {/* OTP Input Form */}
              <form onSubmit={handleOtpSubmit}>
                <div className="form-group">
                  <label>
                    <FiKey style={{ verticalAlign: 'middle' }} /> Enter OTP *
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength="6"
                    className="form-control"
                    style={{ 
                      fontSize: '1.5rem', 
                      textAlign: 'center', 
                      letterSpacing: '0.5rem',
                      fontWeight: 'bold'
                    }}
                    disabled={timeLeft === 0}
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Enter the 6-digit code the patient received
                  </small>
                </div>

                {/* Request Details Summary */}
                <div style={{
                  background: '#f3f4f6',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                    <strong>Patient:</strong>
                    <span>{patientName}</span>
                    
                    <strong>Phone:</strong>
                    <span>{formData.patientPhone}</span>
                    
                    <strong>Access Type:</strong>
                    <span style={{ textTransform: 'capitalize' }}>{formData.accessType}</span>
                    
                    <strong>Duration:</strong>
                    <span>{formData.expiryDuration === 'until_revoked' ? 'Until Revoked' : formData.expiryDuration.toUpperCase()}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setRequestId(null);
                      setTimeLeft(600);
                    }}
                    disabled={otpLoading}
                  >
                    ← Start Over
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={otpLoading || timeLeft === 0 || otp.length !== 6}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {otpLoading ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiKey /> Verify & Grant Access
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAccessForm;
