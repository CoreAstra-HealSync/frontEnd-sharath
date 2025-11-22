import React, { useState } from 'react';
import { pharmacyForgotPassword } from '../../services/apiService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './Auth.css';

const PharmacyForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await pharmacyForgotPassword(email);
      toast.success('Password reset link sent to your email');
      setEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p>Enter your pharmacy email to reset password</p>
        </div>

        {emailSent ? (
          <div className="success-message">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <h3>Check your email</h3>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
              The link will expire in 1 hour
            </p>
            <Link to="/pharmacy/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your pharmacy email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/pharmacy/login" className="auth-link">
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PharmacyForgotPassword;
