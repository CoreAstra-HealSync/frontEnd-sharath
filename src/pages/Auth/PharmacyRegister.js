import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { pharmacyRegister } from '../../services/apiService';
import { FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

const PharmacyRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    contactNo: '', 
    address: '',
    licenseNo: '',
    gstNo: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        toast.success('Location captured!');
        setGettingLocation(false);
      },
      (error) => {
        toast.error('Unable to get location. Please enter manually.');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate coordinates
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        toast.error('Please provide valid latitude and longitude');
        setLoading(false);
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast.error('Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
        setLoading(false);
        return;
      }

      // Build payload matching backend schema
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contactNo: formData.contactNo,
        address: formData.address,
        geoLocation: {
          type: 'Point',
          coordinates: [lng, lat] // [longitude, latitude] - GeoJSON format
        },
        verification: {
          licenseNo: formData.licenseNo,
          gstNo: formData.gstNo || undefined
        }
      };

      await pharmacyRegister(payload);
      toast.success('Registration successful! Please check your email to verify.');
      navigate('/pharmacy/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container pharmacy-register-container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>
        
        <div className="auth-header">
          <div className="auth-logo">💊</div>
          <h1 className="auth-title">Pharmacy Registration</h1>
          <p className="auth-subtitle">Join our healthcare network</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Pharmacy Name *</label>
              <input 
                type="text"
                id="name"
                className="form-input" 
                placeholder="e.g., MedPlus Pharmacy"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input 
                type="email"
                id="email"
                className="form-input" 
                placeholder="pharmacy@example.com"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNo">Contact Number * (10 digits)</label>
              <input 
                type="tel"
                id="contactNo"
                className="form-input" 
                placeholder="1234567890"
                pattern="[0-9]{10}"
                maxLength="10"
                value={formData.contactNo} 
                onChange={(e) => setFormData({...formData, contactNo: e.target.value.replace(/\D/g, '')})} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input 
                type="text"
                id="address"
                className="form-input" 
                placeholder="123 Main St, City, State, ZIP"
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password * (min 6 characters)</label>
              <input 
                type="password"
                id="password"
                className="form-input" 
                placeholder="••••••••"
                minLength="6"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
          </div>

          {/* License & Verification Section */}
          <div className="form-section">
            <h3 className="section-title">License & Verification</h3>
            
            <div className="form-group">
              <label htmlFor="licenseNo">Medical License Number *</label>
              <input 
                type="text"
                id="licenseNo"
                className="form-input" 
                placeholder="e.g., PHL-12345-2024"
                value={formData.licenseNo} 
                onChange={(e) => setFormData({...formData, licenseNo: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="gstNo">GST Number (Optional)</label>
              <input 
                type="text"
                id="gstNo"
                className="form-input" 
                placeholder="e.g., 22AAAAA0000A1Z5"
                value={formData.gstNo} 
                onChange={(e) => setFormData({...formData, gstNo: e.target.value})} 
              />
              <small className="field-hint">GST registration is optional but recommended</small>
            </div>
          </div>

          {/* Location Section */}
          <div className="form-section location-section">
            <div className="section-header">
              <h3 className="section-title">📍 Location Coordinates *</h3>
              <button 
                type="button" 
                className="btn-location"
                onClick={getLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? '⏳ Getting Location...' : '📍 Get Current Location'}
              </button>
            </div>
            <p className="section-description">
              Help patients find your pharmacy by providing accurate location coordinates
            </p>
            
            <div className="coordinates-grid">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input 
                  type="text"
                  id="latitude"
                  className="form-input" 
                  placeholder="e.g., 28.6139"
                  value={formData.latitude} 
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input 
                  type="text"
                  id="longitude"
                  className="form-input" 
                  placeholder="e.g., 77.2090"
                  value={formData.longitude} 
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})} 
                  required 
                />
              </div>
            </div>
            {(formData.latitude && formData.longitude) && (
              <div className="location-preview">
                ✓ Location set: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary btn-submit" disabled={loading}>
            {loading ? '⏳ Registering...' : '✓ Register Pharmacy'}
          </button>

          <p className="terms-text">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>

        <div className="auth-links">
          <div className="auth-link">
            Already have an account? <Link to="/pharmacy/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyRegister;
