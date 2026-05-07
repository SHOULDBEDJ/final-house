import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-hot-toast';
import { LogIn, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, var(--bg-dark) 0%, #1e1b4b 100%)'
    }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="text-center mb-4">
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>16 Eyes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to manage your farmhouse</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2" style={{ fontSize: '0.875rem' }}>
              <User size={16} /> Username
            </label>
            <input 
              type="text" 
              placeholder="Enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2" style={{ fontSize: '0.875rem' }}>
              <Lock size={16} /> Password
            </label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary w-full justify-center mt-4"
            disabled={loading}
          >
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-4">
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Default: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
