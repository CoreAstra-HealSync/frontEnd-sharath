import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { hospitalLogin } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const HospitalLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await hospitalLogin(formData);
      const { token, message } = response.data;
      
      // Create user object from form data (backend doesn't return hospital object)
      const hospital = {
        email: formData.email,
      };
      
      login(hospital, token, 'hospital');
      toast.success(message || 'Login successful!');
      navigate('/hospital/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link"><FiArrowLeft /> Back</Link>
        <div className="auth-header">
          <div className="auth-logo">🏥</div>
          <h1 className="auth-title">Hospital Login</h1>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div className="form-group" style={{ textAlign: 'right', marginTop: '-10px' }}>
            <Link to="/hospital/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--bright-teal-blue)' }}>Forgot Password?</Link>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="auth-links">
          <div className="auth-link">Don't have an account? <Link to="/hospital/register">Register</Link></div>
        </div>
      </div>
    </div>
  );
};

export default HospitalLogin;
