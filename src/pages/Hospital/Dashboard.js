import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { 
  createDoctorByHospital, 
  getHospitalDoctors, 
  getDoctorStats,
  updateDoctor,
  deleteDoctor,
  toggleDoctorVerification,
  getHospitalProfile
} from '../../services/apiService';
import { FiUserPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiRefreshCw, FiX } from 'react-icons/fi';
import '../Dashboard.css';

const HospitalDashboard = () => {
  const [showCreateDoctor, setShowCreateDoctor] = useState(false);
  const [showEditDoctor, setShowEditDoctor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone_no: '',
    specialization: '',
    licenseNo: '',
    experienceYears: 0
  });

  useEffect(() => {
    fetchHospitalInfo();
    fetchDoctors();
    fetchStats();
  }, []);

  const fetchHospitalInfo = async () => {
    try {
      const response = await getHospitalProfile();
      setHospitalInfo(response.data.data);
    } catch (error) {
      console.error('Failed to fetch hospital info:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await getHospitalDoctors();
      setDoctors(response.data.data.doctors || []);
    } catch (error) {
      toast.error('Failed to load doctors');
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getDoctorStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm({ ...doctorForm, [name]: value });
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createDoctorByHospital(doctorForm);
      toast.success(response.data.message || 'Doctor created successfully! Verification email sent.');
      
      // Reset form
      setDoctorForm({
        name: '',
        username: '',
        email: '',
        password: '',
        phone_no: '',
        specialization: '',
        licenseNo: '',
        experienceYears: 0
      });
      setShowCreateDoctor(false);
      fetchDoctors();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoctor(selectedDoctor._id, doctorForm);
      toast.success('Doctor updated successfully');
      setShowEditDoctor(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${doctorName}?`)) return;

    try {
      await deleteDoctor(doctorId);
      toast.success('Doctor removed successfully');
      fetchDoctors();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleVerificationToggle = async (doctorId, newStatus) => {
    try {
      await toggleDoctorVerification(doctorId, newStatus);
      toast.success(`Verification status updated to ${newStatus}`);
      fetchDoctors();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update verification');
    }
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorForm({
      name: doctor.name,
      username: doctor.username,
      email: doctor.email,
      phone_no: doctor.phone_no || '',
      specialization: doctor.specialization || '',
      licenseNo: doctor.licenseNo || '',
      experienceYears: doctor.experienceYears || 0
    });
    setShowEditDoctor(true);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="hospital" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>🏥 {hospitalInfo?.name || 'Hospital Dashboard'}</h1>
          <p>Manage your doctors and healthcare facility</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card" style={{ '--accent-color': '#4F46E5' }}>
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}>
                👨‍⚕️
              </div>
            </div>
            <div className="stat-value">{stats?.totalDoctors || 0}</div>
            <div className="stat-label">Total Doctors</div>
          </div>

          <div className="stat-card" style={{ '--accent-color': '#10B981' }}>
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }}>
                ✓
              </div>
            </div>
            <div className="stat-value">{stats?.verifiedDoctors || 0}</div>
            <div className="stat-label">Verified Doctors</div>
          </div>

          <div className="stat-card" style={{ '--accent-color': '#F59E0B' }}>
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' }}>
                ⏳
              </div>
            </div>
            <div className="stat-value">{stats?.pendingDoctors || 0}</div>
            <div className="stat-label">Pending Approval</div>
          </div>

          <div className="stat-card" style={{ '--accent-color': '#06B6D4' }}>
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)' }}>
                🏥
              </div>
            </div>
            <div className="stat-value">{hospitalInfo?.type || 'N/A'}</div>
            <div className="stat-label">Facility Type</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setDoctorForm({
                  name: '',
                  username: '',
                  email: '',
                  password: '',
                  phone_no: '',
                  specialization: '',
                  licenseNo: '',
                  experienceYears: 0
                });
                setShowCreateDoctor(true);
              }}
            >
              <FiUserPlus /> Create Doctor Account
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                fetchDoctors();
                fetchStats();
              }}
            >
              <FiRefreshCw /> Refresh Data
            </button>
          </div>
        </div>

        {/* Doctors List */}
        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Doctors ({doctors.length})</h2>
          </div>

          {doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍⚕️</div>
              <h3>No Doctors Yet</h3>
              <p>Create your first doctor account to get started</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateDoctor(true)}
              >
                <FiUserPlus /> Create Doctor
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, color: '#1e293b' }}>Dr. {doctor.name}</h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: doctor.verification?.status === 'verified' ? '#dcfce7' : doctor.verification?.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: doctor.verification?.status === 'verified' ? '#166534' : doctor.verification?.status === 'rejected' ? '#991b1b' : '#92400e'
                      }}>
                        {doctor.verification?.status || 'pending'}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                      <strong>Specialization:</strong> {doctor.specialization || 'Not specified'}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                      <strong>Email:</strong> {doctor.email}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                      <strong>Phone:</strong> {doctor.phone_no || 'Not provided'}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                      <strong>Experience:</strong> {doctor.experienceYears || 0} years
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {doctor.verification?.status !== 'verified' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleVerificationToggle(doctor._id, 'verified')}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        <FiCheckCircle /> Verify
                      </button>
                    )}
                    {doctor.verification?.status === 'verified' && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleVerificationToggle(doctor._id, 'pending')}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        <FiXCircle /> Revoke
                      </button>
                    )}
                    <button
                      className="btn btn-secondary"
                      onClick={() => openEditModal(doctor)}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteDoctor(doctor._id, doctor.name)}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Doctor Modal */}
        {showCreateDoctor && (
          <div className="modal-overlay" onClick={() => setShowCreateDoctor(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FiUserPlus /> Create Doctor Account</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateDoctor(false)}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleCreateDoctor} className="modal-form">
                <div className="form-group">
                  <label>Doctor Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Dr. John Doe"
                    value={doctorForm.name}
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
                    placeholder="johndoe"
                    value={doctorForm.username}
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
                    value={doctorForm.email}
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
                    placeholder="9876543210"
                    value={doctorForm.phone_no}
                    onChange={handleChange}
                    pattern="[0-9]{10,15}"
                    title="10-15 digit phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••"
                    minLength="6"
                    value={doctorForm.password}
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
                    placeholder="e.g., Cardiology"
                    value={doctorForm.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>License Number *</label>
                  <input
                    type="text"
                    name="licenseNo"
                    className="form-input"
                    placeholder="MCI-12345-2024"
                    value={doctorForm.licenseNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="experienceYears"
                    className="form-input"
                    placeholder="5"
                    min="0"
                    value={doctorForm.experienceYears}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateDoctor(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Creating...' : '✓ Create Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Doctor Modal */}
        {showEditDoctor && (
          <div className="modal-overlay" onClick={() => setShowEditDoctor(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FiEdit2 /> Edit Doctor Details</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowEditDoctor(false)}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleEditDoctor} className="modal-form">
                <div className="form-group">
                  <label>Doctor Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Dr. John Doe"
                    value={doctorForm.name}
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
                    placeholder="9876543210"
                    value={doctorForm.phone_no}
                    onChange={handleChange}
                    pattern="[0-9]{10,15}"
                    title="10-15 digit phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-input"
                    placeholder="e.g., Cardiology"
                    value={doctorForm.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>License Number *</label>
                  <input
                    type="text"
                    name="licenseNo"
                    className="form-input"
                    placeholder="MCI-12345-2024"
                    value={doctorForm.licenseNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="experienceYears"
                    className="form-input"
                    placeholder="5"
                    min="0"
                    value={doctorForm.experienceYears}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditDoctor(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '⏳ Updating...' : '✓ Update Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
