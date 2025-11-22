import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { updatePharmacyProfile } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMapPin, FiPhone, FiClock, FiSave } from 'react-icons/fi';
import '../Dashboard.css';

const PharmacyProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNo: '',
    openingHours: {
      open: '09:00',
      close: '21:00'
    },
    isOpen: true,
    latitude: '',
    longitude: '',
    gstNo: '',
    licenseNo: ''
  });

  useEffect(() => {
    // Pre-fill with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        contactNo: user.contactNo || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate contact number
    if (formData.contactNo && !/^\d{10}$/.test(formData.contactNo)) {
      toast.error('Contact number must be 10 digits');
      return;
    }

    // Validate coordinates
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (formData.latitude && (isNaN(lat) || lat < -90 || lat > 90)) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }

    if (formData.longitude && (isNaN(lng) || lng < -180 || lng > 180)) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        contactNo: formData.contactNo,
        openingHours: formData.openingHours,
        isOpen: formData.isOpen,
        gstNo: formData.gstNo || undefined,
        licenseNo: formData.licenseNo || undefined
      };

      // Only include geoLocation if both coordinates provided
      if (formData.latitude && formData.longitude) {
        payload.geoLocation = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }

      await updatePharmacyProfile(payload);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success('Location captured');
      },
      (error) => {
        toast.error('Failed to get location: ' + error.message);
      }
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="pharmacy" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiUser /> Pharmacy Profile</h1>
          <p>Update your pharmacy information</p>
        </div>

        <div className="page-section">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title"><FiUser /> Basic Information</h3>
              
              <div className="form-group">
                <label>Pharmacy Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter pharmacy name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({...formData, contactNo: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  className="form-input"
                  placeholder="Full pharmacy address"
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div className="form-section">
              <h3 className="section-title"><FiClock /> Operating Hours</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.openingHours.open}
                    onChange={(e) => setFormData({
                      ...formData, 
                      openingHours: { ...formData.openingHours, open: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.openingHours.close}
                    onChange={(e) => setFormData({
                      ...formData, 
                      openingHours: { ...formData.openingHours, close: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Currently Open</label>
                  <select
                    className="form-input"
                    value={formData.isOpen}
                    onChange={(e) => setFormData({...formData, isOpen: e.target.value === 'true'})}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="form-section location-section">
              <h3 className="section-title"><FiMapPin /> Location Coordinates</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Update your pharmacy location for better customer discovery
              </p>
              
              <div className="coordinates-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="form-input"
                    placeholder="e.g., 28.6139"
                    min="-90"
                    max="90"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="form-input"
                    placeholder="e.g., 77.2090"
                    min="-180"
                    max="180"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-location"
                onClick={getCurrentLocation}
              >
                <FiMapPin /> Get Current Location
              </button>
            </div>

            {/* License & Verification */}
            <div className="form-section">
              <h3 className="section-title">License & Verification</h3>
              <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                ⚠️ Updating these fields will reset verification status to "pending"
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pharmacy license number"
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>GST Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="GST registration number"
                    value={formData.gstNo}
                    onChange={(e) => setFormData({...formData, gstNo: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary">
                <FiSave /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyProfile;
