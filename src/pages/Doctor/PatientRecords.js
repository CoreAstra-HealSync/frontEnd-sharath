import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { getPatientRecords, createFormEntry, uploadDocumentForPatient } from '../../services/apiService';
import { 
  FiUser, FiFileText, FiActivity, FiClock, FiPhone, 
  FiMail, FiCalendar, FiHeart, FiArrowLeft, FiPlus, FiX, FiUpload 
} from 'react-icons/fi';
import '../Dashboard.css';

const PatientRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [healthForms, setHealthForms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [bpData, setBpData] = useState(null);
  const [sugarData, setSugarData] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('form'); // 'form' or 'document'
  const [uploadFormData, setUploadFormData] = useState({
    formType: 'Prescription',
    data: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const formTypes = [
    'Prescription',
    'Diagnosis',
    'Lab Report',
    'Medical History',
    'Treatment Plan',
    'Progress Notes',
    'Consultation Notes',
    'Referral',
    'Other'
  ];

  useEffect(() => {
    fetchPatientRecords();
  }, [patientId]);

  const fetchPatientRecords = async () => {
    setLoading(true);
    try {
      const response = await getPatientRecords(patientId);
      const { patient, healthForms, documents, bpData, sugarData, reminders, accessInfo } = response.data.data;
      
      setPatient(patient);
      setHealthForms(healthForms);
      setDocuments(documents || []);
      setBpData(bpData);
      setSugarData(sugarData);
      setReminders(reminders || []);
      setAccessInfo(accessInfo);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load patient records';
      
      if (error.response?.status === 403) {
        toast.error('🚫 Access Denied: Your access to this patient has been revoked or expired.');
        setTimeout(() => navigate('/doctor/patients'), 1500);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      if (uploadType === 'form') {
        const payload = {
          patientId: patientId,
          formType: uploadFormData.formType,
          data: uploadFormData.data,
          description: uploadFormData.description
        };

        await createFormEntry(payload);
        toast.success('✅ Health form uploaded successfully!');
      } else {
        // Document upload
        if (!selectedFile) {
          toast.error('Please select a file to upload');
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('patientId', patientId);

        console.log('[UPLOAD] Uploading document for patient:', patientId);
        console.log('[UPLOAD] File:', selectedFile.name);

        const response = await uploadDocumentForPatient(formData);
        
        if (response.data.ok && response.data.stored) {
          toast.success('✅ Medical document uploaded and processed successfully!');
        } else {
          toast.warning(response.data.message || 'Document was not recognized as medical');
        }
      }
      
      setShowUploadModal(false);
      setUploadFormData({ formType: 'Prescription', data: '', description: '' });
      setSelectedFile(null);
      fetchPatientRecords(); // Refresh the list
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to upload';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAccessBadge = () => {
    if (!accessInfo) return null;
    
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: '600',
          background: '#e0f7fa',
          color: '#006064'
        }}>
          👁️ View
        </span>
        <span style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: '600',
          background: '#dcfce7',
          color: '#166534'
        }}>
          📤 Upload
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="doctor" />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading patient records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="doctor" />
        <div className="dashboard-content">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <h3>No Access</h3>
            <p>You don't have permission to view this patient's records</p>
            <button className="btn btn-primary" onClick={() => navigate('/doctor/patients')}>
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="doctor" />
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/doctor/patients')}
              style={{ padding: '0.5rem 1rem' }}
            >
              <FiArrowLeft /> Back
            </button>
            <div style={{ flex: 1 }}>
              <h1><FiUser /> {patient.name}'s Medical Records</h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {getAccessBadge()}
                {accessInfo?.expiresAt && (
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    background: '#dcfce7',
                    color: '#166534'
                  }}>
                    <FiClock style={{ verticalAlign: 'middle' }} /> Expires: {formatDate(accessInfo.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Profile */}
        <div className="page-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>👤 Patient Information</h2>
            {accessInfo?.canEdit && (
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/doctor/patient/${patientId}/edit`, {
                  state: { patient, type: 'profile' }
                })}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiUser size={20} color="#0077b6" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{patient.name}</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiMail size={20} color="#00b4d8" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{patient.email}</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiPhone size={20} color="#90e0ef" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{patient.phone_no || 'N/A'}</div>
                </div>
              </div>
            </div>

            {patient.age && (
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FiCalendar size={20} color="#03045e" />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Age</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{patient.age} years</div>
                  </div>
                </div>
              </div>
            )}

            {patient.gender && (
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FiUser size={20} color="#0077b6" />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gender</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{patient.gender}</div>
                  </div>
                </div>
              </div>
            )}

            {patient.emergencyContact && (
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FiPhone size={20} color="#dc2626" />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Emergency</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{patient.emergencyContact}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Forms */}
        <div className="page-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2><FiFileText /> Health Forms & Records</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiPlus /> Upload New Record
            </button>
          </div>
          {healthForms.length > 0 ? (
            <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
              {healthForms.map((form) => (
                <div key={form._id} style={{
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = 'var(--primary-teal)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}>
                  {/* Form Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-teal))',
                    padding: '1.25rem 1.5rem',
                    color: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700' }}>
                          📋 {form.formType || 'Health Record'}
                        </h3>
                        <p style={{ margin: '0.5rem 0 0', opacity: 0.95, fontSize: '0.95rem' }}>
                          <FiCalendar style={{ verticalAlign: 'middle' }} /> Recorded on {formatDate(form.createdAt)}
                        </p>
                      </div>
                      {accessInfo?.canEdit && (
                        <button
                          className="btn"
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            fontWeight: '600',
                            backdropFilter: 'blur(10px)'
                          }}
                          onClick={() => navigate(`/doctor/patient/${patientId}/edit`, {
                            state: { form, type: 'form', patient }
                          })}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          ✏️ Edit Record
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Form Data */}
                  {form.data ? (
                    <div style={{ padding: '2rem 1.5rem' }}>
                      {(() => {
                        // Handle different data formats
                        let dataEntries = [];
                        
                        if (typeof form.data === 'string') {
                          try {
                            // Try to parse if it's a JSON string
                            const parsed = JSON.parse(form.data);
                            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                              // Check if it's a string split into numeric keys (e.g., {"0":"h","1":"e"...})
                              const keys = Object.keys(parsed);
                              const isNumericKeys = keys.every(k => !isNaN(k));
                              
                              if (isNumericKeys && keys.length > 0) {
                                // Reconstruct the string from numeric keys
                                const reconstructed = keys.sort((a, b) => parseInt(a) - parseInt(b))
                                  .map(k => parsed[k])
                                  .join('');
                                dataEntries = [['Health Record', reconstructed]];
                              } else {
                                dataEntries = Object.entries(parsed);
                              }
                            } else {
                              // If it's just a string value, display it as a single entry
                              dataEntries = [['Health Record', form.data]];
                            }
                          } catch {
                            // If parsing fails, treat as plain text
                            dataEntries = [['Health Record', form.data]];
                          }
                        } else if (typeof form.data === 'object' && !Array.isArray(form.data)) {
                          // Check if object has numeric keys (character split issue)
                          const keys = Object.keys(form.data);
                          const isNumericKeys = keys.every(k => !isNaN(k));
                          
                          if (isNumericKeys && keys.length > 0) {
                            // Reconstruct the string from numeric keys
                            const reconstructed = keys.sort((a, b) => parseInt(a) - parseInt(b))
                              .map(k => form.data[k])
                              .join('');
                            dataEntries = [['Health Record', reconstructed]];
                          } else {
                            dataEntries = Object.entries(form.data);
                          }
                        } else if (Array.isArray(form.data)) {
                          // Handle array data
                          dataEntries = form.data.map((item, index) => [`Record ${index + 1}`, JSON.stringify(item, null, 2)]);
                        }
                        
                        // Filter out empty values
                        dataEntries = dataEntries.filter(([key, value]) => 
                          value !== null && 
                          value !== undefined && 
                          value !== '' && 
                          !(Array.isArray(value) && value.length === 0)
                        );
                        
                        if (dataEntries.length === 0) {
                          return (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              <FiFileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                              <p>No data recorded for this form</p>
                            </div>
                          );
                        }
                        
                        return (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.25rem'
                          }}>
                            {dataEntries.map(([key, value]) => {
                              const displayValue = typeof value === 'object' 
                                ? JSON.stringify(value, null, 2) 
                                : String(value);
                              
                              return (
                                <div key={key} style={{
                                  background: 'var(--bg-secondary)',
                                  padding: '1.25rem',
                                  borderRadius: '12px',
                                  border: '2px solid var(--border-color)',
                                  transition: 'all 0.2s ease',
                                  position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--primary-teal)';
                                  e.currentTarget.style.transform = 'translateY(-3px)';
                                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 119, 182, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--border-color)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}>
                                  {/* Icon indicator */}
                                  <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-teal)',
                                    boxShadow: '0 0 10px var(--primary-teal)'
                                  }} />
                                  
                                  {/* Field Label */}
                                  <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    color: 'var(--primary-blue)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px',
                                    marginBottom: '0.75rem',
                                    paddingRight: '1rem'
                                  }}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                  </div>
                                  
                                  {/* Field Value */}
                                  <div style={{
                                    fontSize: '1.15rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.5',
                                    whiteSpace: typeof value === 'object' ? 'pre-wrap' : 'normal'
                                  }}>
                                    {displayValue}
                                  </div>
                                  
                                  {/* Value indicator for special fields */}
                                  {(key.toLowerCase().includes('blood') || 
                                    key.toLowerCase().includes('pressure') ||
                                    key.toLowerCase().includes('sugar') ||
                                    key.toLowerCase().includes('heart') ||
                                    key.toLowerCase().includes('temperature')) && (
                                    <div style={{
                                      marginTop: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: 'var(--text-secondary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      <FiActivity size={14} />
                                      <span>Vital Sign</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <FiFileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                      <p>No data recorded for this form</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FiFileText /></div>
              <h3>No Health Records</h3>
              <p>This patient has no health forms recorded yet</p>
            </div>
          )}
        </div>

        {/* Medical Documents */}
        <div className="page-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2><FiFileText /> Medical Documents</h2>
          </div>
          {documents.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
              {documents.map((doc) => (
                <div key={doc._id} style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = 'var(--primary-teal)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        📄 {doc.fileName || doc.originalFileName || 'Medical Document'}
                      </h3>
                      <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <FiCalendar style={{ verticalAlign: 'middle' }} /> Uploaded on {formatDate(doc.uploadedAt)}
                      </p>
                      
                      {/* Document Type */}
                      {doc.documentType && (
                        <div style={{ 
                          display: 'inline-block',
                          marginTop: '0.75rem',
                          padding: '0.4rem 0.8rem',
                          background: 'var(--primary-blue)',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {doc.documentType}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Extracted Data */}
                  {doc.ocrText && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        📝 Extracted Text
                      </h4>
                      <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                        {doc.ocrText.substring(0, 500)}{doc.ocrText.length > 500 ? '...' : ''}
                      </p>
                    </div>
                  )}

                  {/* NLP Entities */}
                  {doc.entities && doc.entities.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        🏷️ Identified Medical Terms
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {doc.entities.slice(0, 10).map((entity, idx) => (
                          <span key={idx} style={{
                            padding: '0.4rem 0.8rem',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {entity.text || entity}
                          </span>
                        ))}
                        {doc.entities.length > 10 && (
                          <span style={{ 
                            padding: '0.4rem 0.8rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem'
                          }}>
                            +{doc.entities.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FiFileText /></div>
              <h3>No Medical Documents</h3>
              <p>This patient has no documents uploaded yet</p>
            </div>
          )}
        </div>

        {/* Blood Pressure Tracking */}
        {bpData && (
          <div className="page-section">
            <h2><FiActivity /> Blood Pressure Tracking</h2>
            
            {/* Medication Info */}
            {(bpData.drugName || bpData.dosage) && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #fbbf24'
              }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#92400e' }}>
                  💊 Current Medication
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {bpData.drugName && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: '600' }}>Drug Name</div>
                      <div style={{ fontSize: '1.1rem', color: '#92400e', fontWeight: '700' }}>{bpData.drugName}</div>
                    </div>
                  )}
                  {bpData.dosage && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: '600' }}>Dosage</div>
                      <div style={{ fontSize: '1.1rem', color: '#92400e', fontWeight: '700' }}>{bpData.dosage}</div>
                    </div>
                  )}
                  {bpData.tabletsPerDay && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: '600' }}>Tablets/Day</div>
                      <div style={{ fontSize: '1.1rem', color: '#92400e', fontWeight: '700' }}>{bpData.tabletsPerDay}</div>
                    </div>
                  )}
                  {bpData.stockAvailable !== null && bpData.stockAvailable !== undefined && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: '600' }}>Stock Available</div>
                      <div style={{ fontSize: '1.1rem', color: '#92400e', fontWeight: '700' }}>{bpData.stockAvailable} tablets</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Readings */}
            {bpData.readings && bpData.readings.length > 0 ? (
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Recent Readings ({bpData.readings.length} total)</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {bpData.readings.slice(0, 10).map((reading, idx) => (
                    <div key={reading._id || idx} style={{
                      background: 'var(--bg-card)',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Blood Pressure</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                            {reading.systolic}/{reading.diastolic}
                          </div>
                        </div>
                        {reading.pulse && (
                          <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pulse</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#10b981' }}>
                              {reading.pulse} bpm
                            </div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</div>
                          <span style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            background: reading.status === 'normal' ? '#dcfce7' : reading.status === 'high' ? '#fee2e2' : '#fef3c7',
                            color: reading.status === 'normal' ? '#166534' : reading.status === 'high' ? '#991b1b' : '#92400e'
                          }}>
                            {reading.category}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <FiCalendar style={{ verticalAlign: 'middle' }} /> {formatDate(reading.recordedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {bpData.readings.length > 10 && (
                  <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                    Showing 10 of {bpData.readings.length} readings
                  </p>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><FiActivity /></div>
                <h3>No BP Readings</h3>
                <p>Patient has not recorded any blood pressure readings yet</p>
              </div>
            )}
          </div>
        )}

        {/* Sugar/Glucose Tracking */}
        {sugarData && (
          <div className="page-section">
            <h2><FiHeart /> Blood Sugar Tracking</h2>
            
            {/* Medication Info */}
            {(sugarData.drugName || sugarData.dosage) && (
              <div style={{
                background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #ec4899'
              }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#831843' }}>
                  💊 Current Medication
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {sugarData.drugName && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#831843', fontWeight: '600' }}>Drug Name</div>
                      <div style={{ fontSize: '1.1rem', color: '#9f1239', fontWeight: '700' }}>{sugarData.drugName}</div>
                    </div>
                  )}
                  {sugarData.dosage && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#831843', fontWeight: '600' }}>Dosage</div>
                      <div style={{ fontSize: '1.1rem', color: '#9f1239', fontWeight: '700' }}>{sugarData.dosage}</div>
                    </div>
                  )}
                  {sugarData.tabletsPerDay && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#831843', fontWeight: '600' }}>Tablets/Day</div>
                      <div style={{ fontSize: '1.1rem', color: '#9f1239', fontWeight: '700' }}>{sugarData.tabletsPerDay}</div>
                    </div>
                  )}
                  {sugarData.stockAvailable !== null && sugarData.stockAvailable !== undefined && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#831843', fontWeight: '600' }}>Stock Available</div>
                      <div style={{ fontSize: '1.1rem', color: '#9f1239', fontWeight: '700' }}>{sugarData.stockAvailable} tablets</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Readings */}
            {sugarData.readings && sugarData.readings.length > 0 ? (
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Recent Readings ({sugarData.readings.length} total)</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {sugarData.readings.slice(0, 10).map((reading, idx) => (
                    <div key={reading._id || idx} style={{
                      background: 'var(--bg-card)',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Glucose Level</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                            {reading.level} mg/dL
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type</div>
                          <span style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            textTransform: 'capitalize'
                          }}>
                            {reading.type}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</div>
                          <span style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            background: reading.status === 'Normal' ? '#dcfce7' : reading.status === 'High' || reading.status === 'Diabetic' ? '#fee2e2' : '#fef3c7',
                            color: reading.status === 'Normal' ? '#166534' : reading.status === 'High' || reading.status === 'Diabetic' ? '#991b1b' : '#92400e'
                          }}>
                            {reading.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <FiCalendar style={{ verticalAlign: 'middle' }} /> {formatDate(reading.recordedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {sugarData.readings.length > 10 && (
                  <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                    Showing 10 of {sugarData.readings.length} readings
                  </p>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><FiHeart /></div>
                <h3>No Sugar Readings</h3>
                <p>Patient has not recorded any blood sugar readings yet</p>
              </div>
            )}
          </div>
        )}

        {/* Reminders & Appointments */}
        {reminders && reminders.length > 0 && (
          <div className="page-section">
            <h2><FiClock /> Reminders & Appointments</h2>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
              {reminders.map((reminder) => {
                const isOverdue = new Date(reminder.reminderDateTime) < new Date() && reminder.status === 'pending';
                const isPending = reminder.status === 'pending';
                
                return (
                  <div key={reminder._id} style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: `2px solid ${isOverdue ? '#ef4444' : isPending ? '#fbbf24' : 'var(--border-color)'}`,
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {reminder.title}
                          </h3>
                          <span style={{
                            padding: '0.3rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'capitalize',
                            background: reminder.reminderType === 'medication' ? '#e0f2fe' :
                                       reminder.reminderType === 'appointment' ? '#dbeafe' :
                                       reminder.reminderType === 'lab-test' ? '#fef3c7' :
                                       reminder.reminderType === 'follow-up' ? '#dcfce7' : '#f3f4f6',
                            color: reminder.reminderType === 'medication' ? '#0369a1' :
                                   reminder.reminderType === 'appointment' ? '#1e40af' :
                                   reminder.reminderType === 'lab-test' ? '#92400e' :
                                   reminder.reminderType === 'follow-up' ? '#166534' : '#374151'
                          }}>
                            {reminder.reminderType}
                          </span>
                        </div>
                        
                        {reminder.description && (
                          <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {reminder.description}
                          </p>
                        )}
                        
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCalendar style={{ color: 'var(--primary-blue)' }} />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              {formatDate(reminder.reminderDateTime)}
                            </span>
                          </div>
                          
                          {reminder.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                📍 {reminder.location}
                              </span>
                            </div>
                          )}
                        </div>

                        {reminder.notes && (
                          <div style={{ 
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)'
                          }}>
                            📝 {reminder.notes}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                          background: reminder.status === 'completed' ? '#dcfce7' :
                                     reminder.status === 'dismissed' ? '#f3f4f6' :
                                     reminder.status === 'expired' ? '#fee2e2' :
                                     isOverdue ? '#fee2e2' : '#fef3c7',
                          color: reminder.status === 'completed' ? '#166534' :
                                 reminder.status === 'dismissed' ? '#6b7280' :
                                 reminder.status === 'expired' ? '#991b1b' :
                                 isOverdue ? '#991b1b' : '#92400e'
                        }}>
                          {isOverdue ? '⚠️ Overdue' : reminder.status}
                        </span>
                        
                        {reminder.priority && reminder.priority !== 'medium' && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <span style={{
                              padding: '0.3rem 0.7rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              background: reminder.priority === 'critical' || reminder.priority === 'high' ? '#fee2e2' : '#e0f2fe',
                              color: reminder.priority === 'critical' || reminder.priority === 'high' ? '#991b1b' : '#0369a1'
                            }}>
                              {reminder.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {reminders.length >= 20 && (
              <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                Showing 20 most recent reminders
              </p>
            )}
          </div>
        )}

        {/* Permissions Info */}
        <div className="page-section">
          <h2>🔐 Your Permissions</h2>
          <div style={{
            background: '#f0f4ff',
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '1rem'
          }}>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '2', color: '#374151' }}>
              <li>✓ View patient profile and contact information</li>
              <li>✓ View health forms and medical records</li>
              <li>✓ View medical documents with AI analysis</li>
              <li>✓ View blood pressure tracking data</li>
              <li>✓ View blood sugar/glucose tracking data</li>
              <li>✓ View reminders and appointments</li>
              <li>✓ Upload new forms and documents</li>
              <li>❌ Cannot edit existing records</li>
              <li>❌ Cannot delete records</li>
            </ul>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
              Access granted on {formatDate(accessInfo?.grantedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}><FiPlus /> Upload Health Record</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadType('form');
                  setSelectedFile(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Upload Type Toggle */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              padding: '0.5rem',
              background: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <button
                type="button"
                onClick={() => setUploadType('form')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: uploadType === 'form' ? 'var(--primary-blue)' : 'transparent',
                  color: uploadType === 'form' ? 'white' : '#6b7280',
                  fontWeight: uploadType === 'form' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <FiFileText style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Health Form
              </button>
              <button
                type="button"
                onClick={() => setUploadType('document')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: uploadType === 'document' ? 'var(--primary-blue)' : 'transparent',
                  color: uploadType === 'document' ? 'white' : '#6b7280',
                  fontWeight: uploadType === 'document' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <FiUpload style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Document File
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {uploadType === 'form' ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Record Type <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={uploadFormData.formType}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, formType: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Select a type...</option>
                      {formTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Medical Data <span style={{ color: 'red' }}>*</span>
                    </label>
                    <textarea
                      value={uploadFormData.data}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, data: e.target.value })}
                      required
                      rows="6"
                      placeholder="Enter medical information, measurements, observations, etc."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Description / Notes
                    </label>
                    <textarea
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                      rows="3"
                      placeholder="Add any additional notes or context..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Select Medical Document <span style={{ color: 'red' }}>*</span>
                    </label>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                      Upload prescription, lab report, scan, or any medical document (PDF, JPG, PNG, DOCX)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '2px dashed #d1d5db',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    />
                    {selectedFile && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--primary-blue)' }}>
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <div style={{ 
                    padding: '1rem', 
                    background: '#eff6ff', 
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
                      <strong>AI Processing:</strong> The document will be automatically analyzed to extract medical information using AI.
                    </p>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadType('form');
                    setSelectedFile(null);
                  }}
                  className="btn btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : uploadType === 'form' ? 'Upload Form' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
