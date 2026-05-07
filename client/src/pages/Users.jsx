import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Users, 
  UserPlus, 
  Search, 
  Pencil, 
  Trash2, 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Save,
  Trash
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'staff' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/api/users', formData);
        toast.success('New user created');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', username: '', password: '', role: 'staff' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error saving user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, username: user.username, password: '', role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page">
      {/* CHECK 1: Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Users size={26} color="#C4920B" />
            <h1 style={{ margin: 0 }}>User Management</h1>
          </div>
          <p className="subtitle">Manage staff accounts and permissions</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingUser(null); setFormData({ name: '', username: '', password: '', role: 'staff' }); setShowModal(true); }}>
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card mb-6">
        <div className="input-with-icon" style={{ maxWidth: '400px' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or username..." 
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CHECK 2: Users Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>MEMBER SINCE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading users...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-circle" style={{ width: '34px', height: '34px' }}>
                        {user.photo ? <img src={user.photo} alt="" className="w-full h-full rounded-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.name || 'Staff User'}</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: user.role === 'SuperAdmin' ? '#EDE9FE' : '#F3F4F6', 
                      color: user.role === 'SuperAdmin' ? '#5B21B6' : '#374151',
                      border: user.role === 'SuperAdmin' ? '1px solid #A78BFA' : '1px solid #D1D5DB'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <ShieldCheck size={14} /> Active
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-2 justify-end">
                      <button className="btn-action-circle" onClick={() => handleEdit(user)}><Pencil size={14} /></button>
                      <button className="btn-action-circle text-red-500" onClick={() => handleDelete(user.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECK 3-5: Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <X className="modal-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label>FULL NAME</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>USERNAME</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>ROLE</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="staff">Staff</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{editingUser ? 'NEW PASSWORD (LEAVE BLANK TO KEEP)' : 'PASSWORD'}</label>
                <input 
                  type="password" 
                  required={!editingUser}
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              
              <div className="flex gap-3 justify-end mt-8">
                <button type="button" className="btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Save size={18} /> {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
