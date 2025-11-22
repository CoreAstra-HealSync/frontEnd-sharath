import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { pharmacyLogin } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const PharmacyLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await pharmacyLogin(formData);
      const { token, message } = response.data;
      
      // Decode JWT to extract pharmacy info
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Create pharmacy object from JWT payload
      const pharmacy = {
        email: payload.email || formData.email,
        name: payload.name || 'Pharmacy',
        id: payload.id
      };
      
      // Use type from JWT payload (should be 'pharmacy')
      const userRole = payload.type || 'pharmacy';
      
      // Set auth state first
      login(pharmacy, token, userRole);
      
      toast.success(message || 'Login successful!');
      
      // Navigate after state is set with longer delay to ensure localStorage is updated
      setTimeout(() => {
        navigate('/pharmacy/dashboard', { replace: true });
      }, 150);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link"><FiArrowLeft /> Back</Link>
        <div className="auth-header">
          <div className="auth-logo">💊</div>
          <h1 className="auth-title">Pharmacy Login</h1>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/pharmacy/forgot-password" style={{ color: 'var(--bright-teal-blue)', fontSize: '0.9rem' }}>
              Forgot Password?
            </Link>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="auth-links">
          <div className="auth-link">Don't have an account? <Link to="/pharmacy/register">Register</Link></div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLogin;
