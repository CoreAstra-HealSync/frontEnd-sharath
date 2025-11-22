import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { createFormEntry, getFormEntries } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { FiFileText, FiPlus, FiTrash, FiEdit, FiX } from 'react-icons/fi';
import '../Dashboard.css';

const HealthForms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    formType: 'Symptoms Report',
    data: '',
    description: ''
  });

  const formTypes = [
    'Symptoms Report',
    'Medical History',
    'Blood Test Results',
    'Blood Pressure Reading',
    'Blood Sugar Reading',
    'Medication Log',
    'Allergy Information',
    'Vaccination Record',
    'Other'
  ];

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      // The backend will verify the user from JWT token
      // We need to decode the token to get the user ID for the API call
      const token = localStorage.getItem('healsync-token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Decode JWT to get user ID (JWT format: header.payload.signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const patientId = payload.id || payload._id || payload.userId || payload.sub;

      console.log('Fetching forms for patient:', patientId);

      const response = await getFormEntries(patientId);
      console.log('Forms response:', response.data);
      setForms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to load forms');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        formType: formData.formType,
        data: formData.data,
        description: formData.description
      };

      console.log('Submitting form:', payload);
      const response = await createFormEntry(payload);
      console.log('Form submitted:', response.data);
      
      toast.success('Health form submitted successfully!');
      setShowModal(false);
      setFormData({ formType: 'Symptoms Report', data: '', description: '' });
      fetchForms();
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to submit form');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiFileText /> Health Forms</h1>
          <p>Track your health data with structured forms</p>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Your Health Records</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> New Form Entry
            </button>
          </div>

          {loading ? (
            <p>Loading forms...</p>
          ) : forms.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {forms.map((form) => (
                <div key={form._id} style={{
                  padding: '1.5rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {form.category || form.formType}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Created: {new Date(form.createdAt).toLocaleDateString()} at {new Date(form.createdAt).toLocaleTimeString()}
                      </p>
                      {/* Show who created this record */}
                      {form.createdBy && form.createdBy._id !== user?._id && (
                        <p style={{
                          color: '#0369a1',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem',
                          fontWeight: '500'
                        }}>
                          📋 Uploaded by: {form.createdBy.name || 'Healthcare Provider'}
                        </p>
                      )}
                    </div>
                    {form.isVerifiedByDoctor && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--turquoise-surf)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                      Data:
                    </strong>
                    <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {(() => {
                        // Handle different data types properly
                        if (typeof form.data === 'string') {
                          return form.data;
                        } else if (typeof form.data === 'object' && form.data !== null) {
                          // Check if it's an object with numeric keys (incorrectly parsed string)
                          const keys = Object.keys(form.data);
                          const isNumericKeys = keys.every(key => !isNaN(key));
                          
                          if (isNumericKeys && keys.length > 0) {
                            // Reconstruct the string from character indices
                            return keys.sort((a, b) => parseInt(a) - parseInt(b))
                              .map(key => form.data[key])
                              .join('');
                          }
                          
                          // Normal object - display as formatted JSON
                          return JSON.stringify(form.data, null, 2);
                        }
                        return String(form.data);
                      })()}
                    </p>
                  </div>

                  {form.description && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                        Description:
                      </strong>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        {form.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No health forms yet</h3>
              <p>Create your first health form entry to track your health data</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <FiPlus /> Create Form Entry
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--bg-primary)',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>New Health Form Entry</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Form Type / Category *</label>
                  <select
                    className="form-input"
                    value={formData.formType}
                    onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                    required
                  >
                    {formTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Health Data / Information *</label>
                  <textarea
                    className="form-input"
                    rows="6"
                    placeholder="Enter your health information, symptoms, measurements, etc.&#10;Example:&#10;Blood Pressure: 120/80 mmHg&#10;Heart Rate: 72 bpm&#10;Notes: Feeling normal, no chest pain"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                    style={{ resize: 'vertical' }}
                  />
                  <small style={{ color: 'var(--text-secondary)' }}>
                    Enter structured data, measurements, or free-form text
                  </small>
                </div>

                <div className="form-group">
                  <label>Additional Description (Optional)</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Any additional notes or context..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Submit Form
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
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

export default HealthForms;
