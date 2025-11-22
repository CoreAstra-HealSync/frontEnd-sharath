import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { updatePatientRecord } from '../../services/apiService';
import { FiSave, FiX, FiEdit, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import '../Dashboard.css';

const EditPatientRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, form, type } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!patient && !form) {
      toast.error('No data to edit');
      navigate(`/doctor/patient/${patientId}/records`);
      return;
    }

    if (type === 'profile' && patient) {
      setFormData({
        age: patient.age || '',
        gender: patient.gender || '',
        phone_no: patient.phone_no || '',
        emergencyContact: patient.emergencyContact || '',
        address: patient.address || '',
        bloodGroup: patient.bloodGroup || ''
      });
    } else if (type === 'form' && form) {
      setFormData(form.data || {});
    }
  }, [patient, form, type, patientId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        type,
        data: formData
      };

      if (type === 'form') {
        updateData.formId = form._id;
      }

      const response = await updatePatientRecord(patientId, updateData);
      toast.success(response.data.message);
      
      setTimeout(() => {
        navigate(`/doctor/patient/${patientId}/records`);
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update record';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!patient && !form) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="doctor" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiEdit /> Edit {type === 'profile' ? 'Patient Profile' : 'Health Form'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {type === 'profile' 
              ? `Editing profile for ${patient?.name}` 
              : `Editing ${form?.formType} form`}
          </p>
        </div>

        <div className="page-section">
          <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
            {type === 'profile' ? (
              <>
                {/* Patient Profile Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>
                      <FiUser style={{ verticalAlign: 'middle' }} /> Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Age"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiUser style={{ verticalAlign: 'middle' }} /> Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <FiPhone style={{ verticalAlign: 'middle' }} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiPhone style={{ verticalAlign: 'middle' }} /> Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      💉 Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>
                      <FiMapPin style={{ verticalAlign: 'middle' }} /> Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Full address"
                      rows={3}
                      className="form-control"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Health Form Fields */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {Object.keys(formData).map((key) => (
                    <div key={key} className="form-group">
                      <label style={{ textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        placeholder={key}
                        className="form-control"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Warning Box */}
            <div style={{
              background: '#fef3c7',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              borderLeft: '4px solid #f59e0b'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>
                <strong>⚠️ Important:</strong> All changes will be logged in the patient's activity history. 
                Make sure the information is accurate before saving.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/doctor/patient/${patientId}/records`)}
                disabled={loading}
              >
                <FiX /> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPatientRecord;
