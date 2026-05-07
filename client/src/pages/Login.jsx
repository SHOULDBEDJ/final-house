import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // CHECK 10: Route Guard - Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('farmhouse_token');
    if (token) {
      navigate('/');
    }

    // CHECK 11: Remember Me Persistence - Read stored user
    const rememberedUser = localStorage.getItem('farmhouse_remembered_user');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // CHECK 9: Basic Validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      // CHECK 9: POST /api/auth/login
      const response = await api.post('/auth/login', { username, password });
      
      // Success: Store JWT as "farmhouse_token"
      localStorage.setItem('farmhouse_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // CHECK 11: Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('farmhouse_remembered_user', username);
      } else {
        localStorage.removeItem('farmhouse_remembered_user');
      }

      navigate('/');
    } catch (err) {
      // CHECK 9: Handle 401/error
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* CHECK 3: Logo Block */}
        <div className="login-logo-circle">
          16
        </div>
        <div className="login-title">
          Booking & Financial Management
        </div>

        {/* CHECK 7: Error Message */}
        {error && (
          <div className="error-card">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* CHECK 4: Username Field */}
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          {/* CHECK 4: Password Field */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Password</label>
            <div className="input-with-icon">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CHECK 5: Remember Me */}
          <div className="flex items-center gap-2 mb-4" style={{ cursor: 'pointer' }} onClick={() => setRememberMe(!rememberMe)}>
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={() => {}} // Handled by div click
              style={{ width: '14px', height: '14px', accentColor: 'var(--navy)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#555' }}>Remember me</span>
          </div>

          {/* CHECK 6: Submit Button */}
          <button 
            type="submit" 
            className="btn-primary w-full justify-center"
            style={{ height: '46px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* CHECK 8: Footer Text */}
      <div className="login-footer">
        THE 16 EYES Farm House v1.0 | 🌿 16 Eyes Farmhouse
      </div>
    </div>
  );
};

export default Login;
