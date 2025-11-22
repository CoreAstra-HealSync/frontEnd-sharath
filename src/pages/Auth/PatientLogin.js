import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { patientLogin } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const PatientLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await patientLogin(formData);
      const { token, message } = response.data;
      
      // Create user object from form data (backend doesn't return user object)
      const user = {
        email: formData.email,
      };
      
      // Set auth state first
      login(user, token, 'patient');
      
      toast.success(message || 'Login successful!');
      
      console.log('PatientLogin - Login successful, tokens stored');
      console.log('PatientLogin - healsync-token:', localStorage.getItem('healsync-token') ? 'set' : 'missing');
      console.log('PatientLogin - token (patient):', localStorage.getItem('token') ? 'set' : 'missing');
      console.log('PatientLogin - healsync-role:', localStorage.getItem('healsync-role'));
      
      // Navigate after state is set
      setTimeout(() => {
        console.log('PatientLogin - Redirecting to dashboard');
        navigate('/patient/dashboard', { replace: true });
      }, 200);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>
        
        <div className="auth-header">
          <div className="auth-logo">🏥</div>
          <h1 className="auth-title">Patient Login</h1>
          <p className="auth-subtitle">Welcome back! Please login to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <div className="auth-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <div className="auth-link">
            Don't have an account? <Link to="/patient/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
