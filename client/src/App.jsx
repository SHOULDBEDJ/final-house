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
  Activity,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

// Pages
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('farmhouse_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // SIDEBAR NAVIGATION ORDER:
  // Dashboard, Bookings, Income, Expenses, Reports, Users, Activity Log, Profile, Settings
  const navItems = [
    { path: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/bookings', icon: <CalendarDays />, label: 'Bookings' },
    { path: '/income', icon: <TrendingUp />, label: 'Income' },
    { path: '/expenses', icon: <TrendingDown />, label: 'Expenses' },
    { path: '/reports', icon: <FileText />, label: 'Reports' },
    { path: '/users', icon: <Users />, label: 'Users' },
    { path: '/activity', icon: <Activity />, label: 'Activity Log' },
    { path: '/profile', icon: <User />, label: 'Profile' },
    { path: '/settings', icon: <Settings />, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '4px', background: 'var(--amber)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
        }}>16</div>
        <span>16 EYES Farm House</span>
      </div>

      {/* Nav Menu */}
      <div className="nav-menu">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Bottom User Info */}
      <div className="sidebar-footer">
        <div className="user-avatar">
          {user.username?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="user-info">
          <span className="username">{user.name || user.username || 'Admin'}</span>
          <span className="role">{user.role || 'SuperAdmin'}</span>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const pathParts = location.pathname.split('/').filter(p => p);
  const pageTitle = pathParts.length > 0 ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : 'Dashboard';

  return (
    <div className="header">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2" style={{ fontSize: '13px', opacity: 0.8 }}>
        <span>Home</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--amber)', fontWeight: 500 }}>{pageTitle}</span>
      </div>

      {/* User Profile Right */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
          <div className="user-avatar" style={{ 
            width: '30px', height: '30px', borderRadius: '50%', background: 'var(--amber)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 
          }}>
            {user.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{user.name || 'Admin'}</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>SuperAdmin</span>
          </div>
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('farmhouse_token');
  return token ? (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <div className="content-area">
          {children}
        </div>
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
        <Route path="/activity" element={<PrivateRoute><div className="card"><h2>Activity Log</h2><p>Coming soon...</p></div></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
