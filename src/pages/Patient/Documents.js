import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { uploadDocument, getDocuments, deleteDocument } from '../../services/apiService';
import { FiFile, FiUpload, FiTrash, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../Dashboard.css';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await uploadDocument(formData);
      if (response.data.ok) {
        toast.success('Document uploaded and analyzed successfully!');
        fetchDocuments();
      } else {
        toast.warning(response.data.message || 'Document uploaded but not recognized as medical');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this document?')) {
      try {
        await deleteDocument(id);
        toast.success('Document deleted');
        fetchDocuments();
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiFile /> Medical Documents</h1>
          <p>Upload and manage your medical records with AI analysis</p>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Upload Document</h2>
          </div>
          <div style={{padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center'}}>
            <input
              type="file"
              id="file-upload"
              accept="image/*,.pdf"
              onChange={handleUpload}
              style={{display: 'none'}}
              disabled={uploading}
            />
            <label htmlFor="file-upload" style={{cursor: uploading ? 'not-allowed' : 'pointer'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📄</div>
              <button
                className="btn btn-primary"
                onClick={() => document.getElementById('file-upload').click()}
                disabled={uploading}
              >
                <FiUpload /> {uploading ? 'Uploading...' : 'Choose File'}
              </button>
              <p style={{marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                Supports: Images, PDF (AI will analyze your document)
              </p>
            </label>
          </div>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Your Documents</h2>
          </div>
          {loading ? (
            <p>Loading documents...</p>
          ) : documents.length > 0 ? (
            <div style={{display: 'grid', gap: '1rem'}}>
              {documents.map((doc) => (
                <div key={doc._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <h4 style={{color: 'var(--text-primary)', marginBottom: '0.5rem'}}>
                      {doc.fileName || doc.name || 'Medical Document'}
                    </h4>
                    <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>
                      Type: {doc.type} | Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    {/* Show if uploaded by doctor */}
                    {doc.uploadedBy && doc.uploadedBy !== user?._id && (
                      <p style={{
                        color: '#0369a1',
                        fontSize: '0.85rem',
                        marginTop: '0.25rem',
                        fontWeight: '500'
                      }}>
                        📋 Uploaded by your healthcare provider
                      </p>
                    )}
                    {doc.nlp?.diagnoses && (
                      <p style={{color: 'var(--bright-teal-blue)', fontSize: '0.85rem', marginTop: '0.5rem'}}>
                        AI Detected: {doc.nlp.diagnoses.join(', ')}
                      </p>
                    )}
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{padding: '0.5rem'}}>
                        <FiDownload />
                      </a>
                    )}
                    <button className="btn btn-danger" style={{padding: '0.5rem'}} onClick={() => handleDelete(doc._id)}>
                      <FiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No documents uploaded yet</h3>
              <p>Upload your first medical document to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
