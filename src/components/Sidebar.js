import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiHome, FiBell, FiFile, FiMessageSquare, FiActivity, 
  FiShield, FiShoppingBag, FiLogOut, FiMoon, FiSun, FiFileText, FiUser, FiGrid, FiClock, FiCalendar
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const patientLinks = [
    { to: '/patient/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/patient/reminders', icon: <FiBell />, label: 'Reminders' },
    { to: '/patient/documents', icon: <FiFile />, label: 'Documents' },
    { to: '/patient/health-forms', icon: <FiFileText />, label: 'Health Forms' },
    { to: '/patient/chat', icon: <FiMessageSquare />, label: 'AI Chat' },
    { to: '/patient/health', icon: <FiActivity />, label: 'Health Tracking' },
    { to: '/patient/access', icon: <FiShield />, label: 'Access Control' },
    { to: '/patient/activity-logs', icon: <FiClock />, label: 'Activity Logs' },
    { to: '/patient/pharmacies', icon: <FiShoppingBag />, label: 'Pharmacies' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/doctor/patients', icon: <FiActivity />, label: 'Patients' },
    { to: '/doctor/appointments', icon: <FiCalendar />, label: 'Appointments' },
    { to: '/doctor/scan-access', icon: <FiGrid />, label: 'Scan QR' },
  ];

  const pharmacyLinks = [
    { to: '/pharmacy/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/pharmacy/inventory', icon: <FiShoppingBag />, label: 'Inventory' },
    { to: '/pharmacy/profile', icon: <FiUser />, label: 'Profile' },
  ];

  const hospitalLinks = [
    { to: '/hospital/dashboard', icon: <FiHome />, label: 'Dashboard' },
  ];

  const links = role === 'patient' ? patientLinks : 
                role === 'doctor' ? doctorLinks : 
                role === 'hospital' ? hospitalLinks : pharmacyLinks;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🏥 HealSync</h2>
      </div>
      
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-btn" onClick={toggleTheme}>
          {theme === 'light' ? <FiMoon /> : <FiSun />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
        <button className="sidebar-btn logout-btn" onClick={logout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
