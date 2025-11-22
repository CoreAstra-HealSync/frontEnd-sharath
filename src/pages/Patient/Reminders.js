import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  dismissReminder
} from '../../services/apiService';
import { FiBell, FiPlus, FiEdit, FiTrash, FiCheck, FiX } from 'react-icons/fi';
import '../Dashboard.css';
import './Reminders.css';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminderType: 'appointment',
    reminderDateTime: '',
    notificationTime: '15-minutes-before',
    priority: 'medium',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await getReminders();
      setReminders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReminder) {
        await updateReminder(editingReminder._id, formData);
        toast.success('Reminder updated successfully');
      } else {
        await createReminder(formData);
        toast.success('Reminder created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchReminders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await deleteReminder(id);
        toast.success('Reminder deleted');
        fetchReminders();
      } catch (error) {
        toast.error('Failed to delete reminder');
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeReminder(id);
      toast.success('Reminder marked as completed');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to complete reminder');
    }
  };

  const handleDismiss = async (id) => {
    try {
      await dismissReminder(id);
      toast.success('Reminder dismissed');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to dismiss reminder');
    }
  };

  const openEditModal = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      reminderType: reminder.reminderType,
      reminderDateTime: new Date(reminder.reminderDateTime).toISOString().slice(0, 16),
      notificationTime: reminder.notificationTime,
      priority: reminder.priority,
      location: reminder.location || '',
      notes: reminder.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      reminderType: 'appointment',
      reminderDateTime: '',
      notificationTime: '15-minutes-before',
      priority: 'medium',
      location: '',
      notes: ''
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiBell /> Reminders</h1>
          <p>Manage your medical appointments and medication reminders</p>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Your Reminders</h2>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <FiPlus /> New Reminder
            </button>
          </div>

          {loading ? (
            <p>Loading reminders...</p>
          ) : reminders.length > 0 ? (
            <div className="reminders-grid">
              {reminders.map((reminder) => (
                <div key={reminder._id} className="reminder-card" style={{borderLeftColor: getPriorityColor(reminder.priority)}}>
                  <div className="reminder-header">
                    <h3>{reminder.title}</h3>
                    <span className="reminder-type">{reminder.reminderType}</span>
                  </div>
                  {reminder.description && <p className="reminder-desc">{reminder.description}</p>}
                  <div className="reminder-datetime">
                    📅 {new Date(reminder.reminderDateTime).toLocaleString()}
                  </div>
                  {reminder.location && <div className="reminder-location">📍 {reminder.location}</div>}
                  <div className="reminder-meta">
                    <span className={`status-badge status-${reminder.status}`}>{reminder.status}</span>
                    <span className="priority-badge" style={{background: getPriorityColor(reminder.priority)}}>
                      {reminder.priority}
                    </span>
                  </div>
                  <div className="reminder-actions">
                    {reminder.status === 'pending' && (
                      <>
                        <button className="action-btn complete-btn" onClick={() => handleComplete(reminder._id)} title="Complete">
                          <FiCheck />
                        </button>
                        <button className="action-btn dismiss-btn" onClick={() => handleDismiss(reminder._id)} title="Dismiss">
                          <FiX />
                        </button>
                      </>
                    )}
                    <button className="action-btn edit-btn" onClick={() => openEditModal(reminder)} title="Edit">
                      <FiEdit />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(reminder._id)} title="Delete">
                      <FiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <h3>No reminders yet</h3>
              <p>Create your first reminder to get started</p>
              <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <FiPlus /> Create Reminder
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form className="reminder-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      className="form-input"
                      value={formData.reminderType}
                      onChange={(e) => setFormData({...formData, reminderType: e.target.value})}
                      required
                    >
                      <option value="appointment">Appointment</option>
                      <option value="prescription">Prescription</option>
                      <option value="medication">Medication</option>
                      <option value="lab-test">Lab Test</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority *</label>
                    <select
                      className="form-input"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.reminderDateTime}
                      onChange={(e) => setFormData({...formData, reminderDateTime: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Notify Me</label>
                    <select
                      className="form-input"
                      value={formData.notificationTime}
                      onChange={(e) => setFormData({...formData, notificationTime: e.target.value})}
                    >
                      <option value="on-time">On Time</option>
                      <option value="15-minutes-before">15 minutes before</option>
                      <option value="1-hour-before">1 hour before</option>
                      <option value="1-day-before">1 day before</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., City Hospital, Room 203"
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingReminder ? 'Update' : 'Create'} Reminder
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

export default Reminders;
