import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiCalendar, FiClock, FiUser, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { listAccesses } from '../../services/apiService';
import '../Dashboard.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    loadPatients();
    loadAppointments();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await listAccesses();
      const activeAccesses = (response.data.data || []).filter(access => access.isActive);
      setPatients(activeAccesses);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadAppointments = () => {
    // Load from localStorage
    const saved = localStorage.getItem('doctorAppointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  };

  const saveAppointments = (updatedAppointments) => {
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.patientId || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAppointment = {
      id: editingAppointment ? editingAppointment.id : Date.now(),
      ...formData,
      createdAt: editingAppointment ? editingAppointment.createdAt : new Date().toISOString()
    };

    let updatedAppointments;
    if (editingAppointment) {
      updatedAppointments = appointments.map(apt => 
        apt.id === editingAppointment.id ? newAppointment : apt
      );
      toast.success('Appointment updated successfully');
    } else {
      updatedAppointments = [...appointments, newAppointment];
      toast.success('Appointment scheduled successfully');
    }

    saveAppointments(updatedAppointments);
    resetForm();
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData(appointment);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const updatedAppointments = appointments.filter(apt => apt.id !== id);
      saveAppointments(updatedAppointments);
      toast.success('Appointment deleted');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status: newStatus } : apt
    );
    saveAppointments(updatedAppointments);
    toast.success(`Appointment marked as ${newStatus}`);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      date: '',
      time: '',
      type: 'consultation',
      notes: '',
      status: 'scheduled'
    });
    setEditingAppointment(null);
    setShowModal(false);
  };

  const handlePatientSelect = (e) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.patientId._id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient ? patient.patientId.name : ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
      case 'completed': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today && apt.status === 'scheduled');
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date >= today && apt.status === 'scheduled')
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="doctor" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1><FiCalendar /> Appointments</h1>
              <p>Manage your patient appointments</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> Schedule Appointment
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-teal))' }}>
                <FiCalendar />
              </div>
            </div>
            <div className="stat-value">{getTodayAppointments().length}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, var(--accent-green), #059669)' }}>
                <FiClock />
              </div>
            </div>
            <div className="stat-value">{getUpcomingAppointments().length}</div>
            <div className="stat-label">Upcoming</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, var(--accent-purple), #7c3aed)' }}>
                <FiCheck />
              </div>
            </div>
            <div className="stat-value">{appointments.filter(a => a.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="page-section">
          <h2><FiCalendar /> Upcoming Appointments</h2>
          {getUpcomingAppointments().length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
              {getUpcomingAppointments().map((appointment) => {
                const statusColor = getStatusColor(appointment.status);
                return (
                  <div key={appointment.id} style={{
                    padding: '1.5rem',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                            <FiUser style={{ verticalAlign: 'middle' }} /> {appointment.patientName}
                          </h3>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`
                          }}>
                            {appointment.status.toUpperCase()}
                          </span>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)'
                          }}>
                            {appointment.type}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                          <div>
                            <FiCalendar style={{ verticalAlign: 'middle' }} /> {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div>
                            <FiClock style={{ verticalAlign: 'middle' }} /> {appointment.time}
                          </div>
                        </div>

                        {appointment.notes && (
                          <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)'
                          }}>
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {appointment.status === 'scheduled' && (
                          <button
                            className="btn btn-success"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            <FiCheck /> Complete
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => handleEdit(appointment)}
                        >
                          <FiEdit2 /> Edit
                        </button>
                        {appointment.status === 'scheduled' && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          >
                            <FiX /> Cancel
                          </button>
                        )}
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FiCalendar /></div>
              <h3>No Upcoming Appointments</h3>
              <p>Schedule an appointment with your patients</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <FiPlus /> Schedule Appointment
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FiCalendar /> {editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}</h2>
                <button className="modal-close" onClick={resetForm}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Patient *</label>
                  <select
                    className="form-input"
                    value={formData.patientId}
                    onChange={handlePatientSelect}
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map(access => (
                      <option key={access._id} value={access.patientId._id}>
                        {access.patientId.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Appointment Type *</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="check-up">Check-up</option>
                    <option value="procedure">Procedure</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
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

export default Appointments;
