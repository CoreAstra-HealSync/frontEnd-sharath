import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { hospitalRegister } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const HospitalRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'hospital',
    address: '',
    contactNo: '',
    geoLocation: {
      coordinates: [0, 0] // [lng, lat]
    },
    verification: {
      registrationNo: '',
      documents: []
    },
    servicesOffered: []
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'registrationNo') {
      setFormData({
        ...formData,
        verification: { ...formData.verification, registrationNo: value }
      });
    } else if (name === 'latitude' || name === 'longitude') {
      const [lng, lat] = formData.geoLocation.coordinates;
      setFormData({
        ...formData,
        geoLocation: {
          coordinates: name === 'longitude' ? [parseFloat(value) || 0, lat] : [lng, parseFloat(value) || 0]
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await hospitalRegister(formData);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/hospital/login');
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
          <div className="auth-logo">🏥</div>
          <h1 className="auth-title">Hospital Registration</h1>
          <p className="auth-subtitle">Register your healthcare facility</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hospital/Center Name *</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              placeholder="City General Hospital" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Type *</label>
            <select 
              name="type" 
              className="form-input" 
              value={formData.type} 
              onChange={handleChange}
              required
            >
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="lab">Laboratory</option>
              <option value="diagnostic_center">Diagnostic Center</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="admin@hospital.com" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Contact Number *</label>
            <input 
              type="tel" 
              name="contactNo" 
              className="form-input" 
              placeholder="+919876543210" 
              pattern="^\+?[0-9]{10,15}$"
              value={formData.contactNo} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea 
              name="address" 
              className="form-input" 
              placeholder="Complete address with city and state" 
              value={formData.address} 
              onChange={handleChange} 
              rows="3"
              required 
            />
          </div>

          <div className="form-group">
            <label>Registration Number *</label>
            <input 
              type="text" 
              name="registrationNo" 
              className="form-input" 
              placeholder="Hospital Registration/License No." 
              value={formData.verification.registrationNo} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Latitude *</label>
              <input 
                type="number" 
                name="latitude" 
                className="form-input" 
                placeholder="12.9716" 
                step="any"
                value={formData.geoLocation.coordinates[1]} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Longitude *</label>
              <input 
                type="number" 
                name="longitude" 
                className="form-input" 
                placeholder="77.5946" 
                step="any"
                value={formData.geoLocation.coordinates[0]} 
                onChange={handleChange} 
                required 
              />
            </div>
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
            {loading ? '⏳ Registering...' : '✓ Register Hospital'}
          </button>
        </form>
        <div className="auth-links">
          <div className="auth-link">Already have an account? <Link to="/hospital/login">Login</Link></div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;
