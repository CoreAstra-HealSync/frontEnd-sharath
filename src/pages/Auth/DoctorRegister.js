import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doctorRegister } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone_no: '',
    password: '',
    specialization: '',
    licenseNo: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await doctorRegister(formData);
      toast.success('Registration successful! Please check your email.');
      navigate('/doctor/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link"><FiArrowLeft /> Back to Home</Link>
        <div className="auth-header">
          <div className="auth-logo">👨‍⚕️</div>
          <h1 className="auth-title">Doctor Registration</h1>
          <p className="auth-subtitle">Join our healthcare network</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              placeholder="Dr. John Doe" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input 
              type="text" 
              name="username" 
              className="form-input" 
              placeholder="Choose a unique username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="doctor@hospital.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input 
              type="tel" 
              name="phone_no" 
              className="form-input" 
              placeholder="e.g., 9876543210" 
              pattern="[0-9]{10,15}"
              value={formData.phone_no} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Specialization *</label>
            <input 
              type="text" 
              name="specialization" 
              className="form-input" 
              placeholder="e.g., Cardiology, Neurology" 
              value={formData.specialization} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Medical License Number *</label>
            <input 
              type="text" 
              name="licenseNo" 
              className="form-input" 
              placeholder="e.g., MCI-12345-2024" 
              value={formData.licenseNo} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password * (min 6 characters)</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              placeholder="••••••" 
              minLength="6"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Registering...' : '✓ Register as Doctor'}
          </button>
        </form>
        <div className="auth-links">
          <div className="auth-link">Already have an account? <Link to="/doctor/login">Login</Link></div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
