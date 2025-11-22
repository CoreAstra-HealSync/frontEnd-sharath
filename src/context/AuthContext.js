import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('healsync-token'));
  const [role, setRole] = useState(localStorage.getItem('healsync-role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could verify token here if needed
      setUser(JSON.parse(localStorage.getItem('healsync-user') || 'null'));
    }
    setLoading(false);
  }, [token]);

  const login = (userData, userToken, userRole) => {
    // Write to localStorage first (synchronous)
    localStorage.setItem('healsync-token', userToken);
    localStorage.setItem('healsync-role', userRole);
    localStorage.setItem('healsync-user', JSON.stringify(userData));
    
    // Also store role-specific token for API interceptor
    if (userRole === 'doctor') {
      localStorage.setItem('doctorToken', userToken);
    } else if (userRole === 'patient') {
      localStorage.setItem('token', userToken);
    } else if (userRole === 'pharmacy') {
      localStorage.setItem('pharmacyToken', userToken);
    } else if (userRole === 'hospital') {
      localStorage.setItem('hospitalToken', userToken);
    }
    
    // Set API header
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    
    // Update state (triggers re-render)
    setUser(userData);
    setToken(userToken);
    setRole(userRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('healsync-token');
    localStorage.removeItem('healsync-role');
    localStorage.removeItem('healsync-user');
    localStorage.removeItem('token');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('pharmacyToken');
    localStorage.removeItem('hospitalToken');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
