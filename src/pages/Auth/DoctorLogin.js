import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { doctorLogin } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await doctorLogin(formData);
      const { token, message } = response.data;
      
      // Create user object from form data (backend doesn't return doctor object)
      const doctor = {
        email: formData.email,
      };
      
      // Set auth state first
      login(doctor, token, 'doctor');
      
      toast.success(message || 'Login successful!');
      
      // Check if there's a pending claim token
      const pendingToken = sessionStorage.getItem('pendingClaimToken');
      console.log('DoctorLogin - Checking pendingClaimToken:', pendingToken ? pendingToken.substring(0, 20) : 'none');
      
      if (pendingToken) {
        sessionStorage.removeItem('pendingClaimToken');
        console.log('DoctorLogin - Redirecting to claim-access with token');
        // Use a longer delay to ensure localStorage is written
        setTimeout(() => {
          navigate(`/doctor/claim-access?token=${pendingToken}`, { replace: true });
        }, 200);
      } else {
        // Navigate to dashboard
        console.log('DoctorLogin - Redirecting to dashboard');
        setTimeout(() => {
          navigate('/doctor/dashboard', { replace: true });
        }, 200);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link"><FiArrowLeft /> Back to Home</Link>
        <div className="auth-header">
          <div className="auth-logo">👨‍⚕️</div>
          <h1 className="auth-title">Doctor Login</h1>
          <p className="auth-subtitle">Access your medical practice dashboard</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-input" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-input" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ textAlign: 'right', marginTop: '-10px' }}>
            <Link to="/doctor/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--bright-teal-blue)' }}>Forgot Password?</Link>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-links">
          <div className="auth-link">Don't have an account? <Link to="/doctor/register">Register</Link></div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
