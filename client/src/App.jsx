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
  ChevronDown,
  ChevronLeft,
  Menu
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

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('farmhouse_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

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
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* CHECK 1: Top Logo Section */}
      <div className="sidebar-logo">
        <div style={{ 
          minWidth: '32px', height: '32px', borderRadius: '4px', background: 'var(--amber)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
        }}>16</div>
        {!isCollapsed && <span style={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>16 EYES Farm House</span>}
      </div>

      {/* Nav Menu */}
      <div className="nav-menu">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            {React.cloneElement(item.icon, { size: 18 })}
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* CHECK 1: Bottom Toggle & User Info */}
      <div className="sidebar-footer">
        <div className="flex items-center gap-3 w-full">
          <div className="user-avatar" style={{ minWidth: '32px' }}>
            {user.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span className="username">{user.name || user.username || 'Admin'}</span>
              <span className="role">SuperAdmin</span>
            </div>
          )}
          {!isCollapsed && (
            <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', color: 'var(--nav-text)' }}>
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Collapse Toggle Arrow */}
      <button 
        className="collapse-toggle-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
};

const Header = ({ isCollapsed }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const pathParts = location.pathname.split('/').filter(p => p);
  const pageTitle = pathParts.length > 0 ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : 'Dashboard';

  return (
    <div className="header">
      {/* CHECK 2: Breadcrumb Left */}
      <div className="flex items-center gap-2" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
        <span style={{ opacity: 0.7 }}>THE 16 EYES Farm House</span>
        <ChevronRight size={14} />
        <span style={{ fontWeight: 500, color: 'white' }}>{pageTitle}</span>
      </div>

      {/* CHECK 2: User Profile Right */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
          <div className="flex flex-col items-end">
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'white' }}>the16eyesfarmhouse</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>SuperAdmin</span>
          </div>
          <div className="user-avatar" style={{ 
            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--amber)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'white' 
          }}>
            {user.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <ChevronDown size={14} color="rgba(255,255,255,0.7)" />
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const token = localStorage.getItem('farmhouse_token');
  
  return token ? (
    <div className="app-layout">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-wrapper ${isCollapsed ? 'expanded' : ''}`}>
        <Header isCollapsed={isCollapsed} />
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
        <Route path="/activity" element={<PrivateRoute><div className="card"><h1>Activity Log</h1><p className="subtitle">Track system events and actions</p></div></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
