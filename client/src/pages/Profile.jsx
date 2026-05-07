import React, { useState, useEffect } from 'react';
import { User, Shield, Calendar, Mail, Home, Info, Save } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ color: 'var(--amber)' }}>My Profile</h1>
        <p className="subtitle">Manage your personal account information</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="flex items-center gap-6 mb-8">
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'var(--amber)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '32px',
            fontWeight: 700
          }}>
            {user.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{user.name || user.username || 'Administrator'}</h2>
            <p className="label-caps">{user.role?.toUpperCase() || 'SUPERADMIN'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <User size={18} style={{ color: 'var(--amber)' }} />
            <div>
              <p className="label-caps">Username</p>
              <p style={{ fontWeight: 500 }}>{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <Shield size={18} style={{ color: 'var(--amber)' }} />
            <div>
              <p className="label-caps">Access Level</p>
              <p style={{ fontWeight: 500 }}>{user.role || 'SuperAdmin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <Mail size={18} style={{ color: 'var(--amber)' }} />
            <div>
              <p className="label-caps">Account Status</p>
              <p style={{ color: 'var(--green)', fontWeight: 600 }}>ACTIVE</p>
            </div>
          </div>
        </div>

        <button className="btn-primary mt-8 w-full justify-center" style={{ background: 'var(--navy)' }}>UPDATE PROFILE</button>
      </div>
    </div>
  );
};

export default Profile;
