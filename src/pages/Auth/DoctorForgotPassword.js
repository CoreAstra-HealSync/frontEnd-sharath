import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doctorForgotPassword } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const DoctorForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorForgotPassword(email);
      toast.success('Password reset link sent to your email!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/doctor/login" className="back-link"><FiArrowLeft /> Back to Login</Link>
        <div className="auth-header">
          <div className="auth-logo">🔒</div>
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to reset password</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address *</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="doctor@hospital.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '📧 Sending...' : '✓ Send Reset Link'}
          </button>
        </form>
        <div className="auth-links">
          <div className="auth-link">Remember your password? <Link to="/doctor/login">Login</Link></div>
        </div>
      </div>
    </div>
  );
};

export default DoctorForgotPassword;
