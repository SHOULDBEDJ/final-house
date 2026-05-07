import React from 'react';
import { User, Shield, Calendar, Mail } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <h1 className="mb-4">My Profile</h1>
      <div className="card glass" style={{ maxWidth: '600px' }}>
        <div className="flex items-center gap-6 mb-6">
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'var(--primary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>{user.name || user.username}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{user.role?.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <User size={20} className="text-muted" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Username</p>
              <p>{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <Shield size={20} className="text-muted" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role</p>
              <p>{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3">
            <Mail size={20} className="text-muted" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Status</p>
              <p style={{ color: 'var(--success)' }}>Active</p>
            </div>
          </div>
        </div>

        <button className="btn-primary mt-6 w-full justify-center">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile;
