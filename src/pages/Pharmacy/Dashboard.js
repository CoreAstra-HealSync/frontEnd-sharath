import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { FiShoppingBag, FiPackage, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { getPharmacyStock, getLowStock, getExpiryAlert } from '../../services/apiService';
import '../Dashboard.css';

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockCount: 0,
    expiringCount: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [stockRes, lowRes, expiryRes] = await Promise.all([
        getPharmacyStock(),
        getLowStock(),
        getExpiryAlert()
      ]);

      setStats({
        totalMedicines: stockRes.data.total || stockRes.data.data?.length || 0,
        lowStockCount: lowRes.data.data?.length || 0,
        expiringCount: expiryRes.data.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="pharmacy" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || 'Pharmacy'}!</h1>
          <p>Your pharmacy management dashboard</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, var(--bright-teal-blue), var(--turquoise-surf))'}}>
                <FiPackage />
              </div>
            </div>
            <div className="stat-value">{stats.totalMedicines}</div>
            <div className="stat-label">Total Medicines</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #f093fb, #f5576c)'}}>
                <FiTrendingUp />
              </div>
            </div>
            <div className="stat-value">{stats.lowStockCount}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{background: 'linear-gradient(135deg, #f59e0b, #ef4444)'}}>
                <FiAlertCircle />
              </div>
            </div>
            <div className="stat-value">{stats.expiringCount}</div>
            <div className="stat-label">Expiring Soon (30 days)</div>
          </div>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            <button className="btn btn-primary" onClick={() => navigate('/pharmacy/inventory')}>
              <FiPackage /> Manage Inventory
            </button>
            <button className="btn btn-secondary">
              <FiShoppingBag /> New Order
            </button>
            <button className="btn btn-secondary">
              <FiTrendingUp /> View Reports
            </button>
          </div>
        </div>

        <div className="page-section">
          <div className="section-header">
            <h2 className="section-title">Recent Orders</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No recent orders</h3>
            <p>Recent pharmacy orders will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
