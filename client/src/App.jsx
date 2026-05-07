import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  User, 
  LogOut,
  Users,
  FileText,
  Activity
} from 'lucide-react';

// Pages (to be implemented)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import Profile from './pages/Profile';
import UsersPage from './pages/Users';

const Sidebar = () => {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/bookings', icon: <CalendarDays size={20} />, label: 'Bookings' },
    { path: '/income', icon: <TrendingUp size={20} />, label: 'Income' },
    { path: '/expenses', icon: <TrendingDown size={20} />, label: 'Expenses' },
    { path: '/reports', icon: <FileText size={20} />, label: 'Reports' },
    { path: '/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="sidebar">
      <div className="mb-4" style={{ padding: '0 1rem' }}>
        <h2 style={{ color: 'var(--primary)' }}>16 Eyes</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FARM HOUSE</p>
      </div>
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
      <div style={{ marginTop: 'auto' }}>
        <button onClick={handleLogout} className="nav-link w-full" style={{ background: 'transparent', border: 'none' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  ) : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
        <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
