import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { getPharmacyStock, addMedicine, updateStock, deleteStock, searchPharmacyStock, getLowStock, getExpiryAlert } from '../../services/apiService';
import { FiPackage, FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiAlertCircle } from 'react-icons/fi';
import '../Dashboard.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, low, expiring
  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    manufacturer: '',
    dosageForm: 'Tablet',
    strength: '',
    quantity: '',
    price: '',
    expiryDate: '',
    batchNo: ''
  });

  useEffect(() => {
    fetchInventory();
  }, [filterType]);

  const fetchInventory = async () => {
    try {
      let response;
      if (filterType === 'low') {
        response = await getLowStock();
      } else if (filterType === 'expiring') {
        response = await getExpiryAlert();
      } else {
        response = await getPharmacyStock();
      }
      setInventory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInventory();
      return;
    }
    
    try {
      const response = await searchPharmacyStock(searchQuery);
      setInventory(response.data.data || []);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleDelete = async (stockId, medicineName) => {
    if (!window.confirm(`Are you sure you want to delete ${medicineName}?`)) {
      return;
    }

    try {
      await deleteStock(stockId);
      toast.success('Medicine deleted');
      fetchInventory();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateStock(editingItem._id, formData);
        toast.success('Medicine updated');
      } else {
        await addMedicine(formData);
        toast.success('Medicine added');
      }
      setShowModal(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ 
      brandName: '',
      genericName: '',
      manufacturer: '',
      dosageForm: 'Tablet',
      strength: '',
      quantity: '',
      price: '',
      expiryDate: '',
      batchNo: ''
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="pharmacy" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiPackage /> Inventory Management</h1>
          <p>Manage your pharmacy stock</p>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Medicine Inventory</h2>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <FiPlus /> Add Medicine
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '250px', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by brand or generic name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={handleSearch}>
                <FiSearch /> Search
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilterType('all'); setSearchQuery(''); }}
              >
                <FiFilter /> All
              </button>
              <button 
                className={`btn ${filterType === 'low' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilterType('low'); setSearchQuery(''); }}
                style={{ background: filterType === 'low' ? '#f59e0b' : undefined }}
              >
                <FiAlertCircle /> Low Stock
              </button>
              <button 
                className={`btn ${filterType === 'expiring' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilterType('expiring'); setSearchQuery(''); }}
                style={{ background: filterType === 'expiring' ? '#ef4444' : undefined }}
              >
                <FiAlertCircle /> Expiring Soon
              </button>
            </div>
          </div>

          {inventory.length > 0 ? (
            <div style={{display: 'grid', gap: '1rem'}}>
              {inventory.map((item) => {
                const medicine = item.medicineId || {};
                const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const isLowStock = item.quantity < 10;
                
                return (
                  <div key={item._id} style={{
                    padding: '1.25rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${isExpiringSoon || isLowStock ? '#f59e0b' : 'var(--bright-teal-blue)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
                        <h4 style={{color: 'var(--text-primary)', margin: 0}}>{medicine.brandName || 'Unknown'}</h4>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: item.status === 'available' ? '#dcfce7' : item.status === 'low' ? '#fef3c7' : '#fee',
                          color: item.status === 'available' ? '#166534' : item.status === 'low' ? '#92400e' : '#c00'
                        }}>
                          {item.status === 'available' && '✓ Available'}
                          {item.status === 'low' && '⚠️ Low Stock'}
                          {item.status === 'out_of_stock' && '❌ Out of Stock'}
                        </span>
                      </div>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0'}}>
                        <strong>Generic:</strong> {medicine.genericName || 'N/A'}
                      </p>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0'}}>
                        <strong>Form:</strong> {medicine.dosageForm || 'N/A'} | <strong>Strength:</strong> {medicine.strength || 'N/A'}
                      </p>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0'}}>
                        <strong>Manufacturer:</strong> {medicine.manufacturer || 'N/A'}
                      </p>
                      <div style={{display: 'flex', gap: '1.5rem', marginTop: '0.5rem'}}>
                        <p style={{color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600'}}>
                          💊 Stock: {item.quantity} units
                        </p>
                        <p style={{color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600'}}>
                          💰 Price: ${item.price}
                        </p>
                      </div>
                      <p style={{color: isExpiringSoon ? '#f59e0b' : 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0'}}>
                        {isExpiringSoon && '⚠️ '}<strong>Expires:</strong> {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                      {item.batchNo && (
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0'}}>
                          <strong>Batch:</strong> {item.batchNo}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" onClick={() => {
                        setEditingItem(item);
                        setFormData({
                          brandName: medicine.brandName || '',
                          genericName: medicine.genericName || '',
                          manufacturer: medicine.manufacturer || '',
                          dosageForm: medicine.dosageForm || 'Tablet',
                          strength: medicine.strength || '',
                          quantity: item.quantity || '',
                          price: item.price || '',
                          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
                          batchNo: item.batchNo || ''
                        });
                        setShowModal(true);
                      }}>
                        <FiEdit /> Edit
                      </button>
                      <button 
                        className="btn" 
                        style={{ background: '#ef4444', color: 'white' }}
                        onClick={() => handleDelete(item._id, medicine.brandName)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💊</div>
              <h3>No inventory items</h3>
              <p>
                {filterType === 'low' && 'No low stock items found'}
                {filterType === 'expiring' && 'No expiring medicines found'}
                {filterType === 'all' && searchQuery ? 'No medicines match your search' : 'Add medicines to your inventory'}
              </p>
              {filterType === 'all' && !searchQuery && (
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                  <FiPlus /> Add First Medicine
                </button>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingItem ? 'Edit' : 'Add'} Medicine</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} style={{padding: '1.5rem'}}>
                <div className="form-group">
                  <label>Brand Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Crocin, Paracetamol"
                    value={formData.brandName}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Generic Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Paracetamol, Ibuprofen"
                    value={formData.genericName}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                    required
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div className="form-group">
                    <label>Dosage Form *</label>
                    <select
                      className="form-input"
                      value={formData.dosageForm}
                      onChange={(e) => setFormData({...formData, dosageForm: e.target.value})}
                      required
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Cream">Cream</option>
                      <option value="Drops">Drops</option>
                      <option value="Inhaler">Inhaler</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Strength *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 500mg, 10ml"
                      value={formData.strength}
                      onChange={(e) => setFormData({...formData, strength: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., GSK, Cipla"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Number of units"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (per unit) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="Price in $"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Batch Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., BT001234"
                      value={formData.batchNo}
                      onChange={(e) => setFormData({...formData, batchNo: e.target.value})}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Add'} Medicine
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

export default Inventory;
