import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { 
  User, 
  Lock, 
  Clock, 
  Camera, 
  Eye, 
  EyeOff, 
  Key, 
  Save, 
  Monitor, 
  Smartphone,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({ name: '', username: '' });
  
  // Password Form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passErrors, setPassErrors] = useState({});

  const fetchData = async () => {
    try {
      const [profileRes, sessionsRes] = await Promise.all([
        api.get('/api/profile'),
        api.get('/api/profile/sessions')
      ]);
      setUser(profileRes.data);
      setProfileForm({ name: profileRes.data.name, username: profileRes.data.username });
      setSessions(sessionsRes.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/profile', profileForm);
      toast.success('Profile updated');
      fetchData();
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passForm.currentPassword) errors.current = 'Current password is required';
    if (passForm.newPassword.length < 8) errors.new = 'New password must be at least 8 characters';
    if (passForm.newPassword !== passForm.confirmPassword) errors.confirm = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPassErrors(errors);
      return;
    }

    try {
      await api.put('/api/profile/password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success('Password updated successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassErrors({});
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error updating password');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await api.post('/api/profile/photo', { photo: reader.result });
        toast.success('Photo updated');
        fetchData();
      } catch (error) {
        toast.error('Upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="profile-page">
      {/* CHECK 1: Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <User size={26} color="#C4920B" />
          <h1 style={{ margin: 0 }}>Profile</h1>
        </div>
        <p className="subtitle">Manage your account information</p>
      </div>

      {/* CHECK 2: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CHECK 3: Account Details Card (Left) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="avatar-circle overflow-hidden" style={{ width: '90px', height: '90px', fontSize: '28px' }}>
                  {user.photo ? (
                    <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.substring(0, 2).toUpperCase() || 'SA'
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} className="text-gray-600" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="badge" style={{ backgroundColor: '#EDE9FE', color: '#5B21B6', border: '1px solid #A78BFA', padding: '4px 12px', fontSize: '12px' }}>
                  {user.role}
                </span>
                <span className="text-gray-400" style={{ fontSize: '13px' }}>
                  Member since {new Date(user.created_at).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              
              <button 
                className="btn-danger mt-6 flex items-center gap-2" 
                style={{ padding: '8px 16px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} /> Change Photo
              </button>
              <p className="text-[#999] mt-2" style={{ fontSize: '11px' }}>
                JPG, JPEG, PNG, GIF or WebP · Max 5 MB
              </p>
            </div>

            <div className="border-t pt-6">
              <span className="label-caps mb-6 block">ACCOUNT DETAILS</span>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={profileForm.username} 
                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})} 
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-4">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CHECK 4: Change Password Card */}
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-6">
              <Lock size={18} className="text-gray-500" />
              <span className="label-caps" style={{ color: '#555' }}>CHANGE PASSWORD</span>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="form-group">
                <label>CURRENT PASSWORD</label>
                <div className="relative">
                  <input 
                    type={showPass.current ? 'text' : 'password'} 
                    value={passForm.currentPassword} 
                    onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})} 
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass({...showPass, current: !showPass.current})}>
                    {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passErrors.current && <p className="text-red-500 text-xs mt-1">{passErrors.current}</p>}
              </div>

              <div className="form-group">
                <label>NEW PASSWORD</label>
                <div className="relative">
                  <input 
                    type={showPass.new ? 'text' : 'password'} 
                    value={passForm.newPassword} 
                    onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})} 
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass({...showPass, new: !showPass.new})}>
                    {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passErrors.new && <p className="text-red-500 text-xs mt-1">{passErrors.new}</p>}
              </div>

              <div className="form-group">
                <label>CONFIRM PASSWORD</label>
                <div className="relative">
                  <input 
                    type={showPass.confirm ? 'text' : 'password'} 
                    value={passForm.confirmPassword} 
                    onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})} 
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}>
                    {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passErrors.confirm && <p className="text-red-500 text-xs mt-1">{passErrors.confirm}</p>}
              </div>

              <button type="submit" className="btn-primary flex items-center gap-2 mt-2">
                <Key size={16} /> Update Password
              </button>
            </form>
          </div>

          {/* CHECK 5: Recent Login Card */}
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={18} className="text-gray-500" />
              <span className="label-caps" style={{ color: '#555' }}>RECENT LOGIN</span>
            </div>
            
            <div className="space-y-4">
              {sessions.length > 0 ? sessions.map((session, i) => (
                <div key={i} className={`flex items-center justify-between ${i !== sessions.length - 1 ? 'border-bottom pb-4' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                      {session.ip_address === '::1' || session.ip_address === '127.0.0.1' ? <Monitor size={18} className="text-gray-400" /> : <Smartphone size={18} className="text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                        {new Date(session.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {session.ip_address === '::1' || session.ip_address === '127.0.0.1' ? 'Browser session' : 'Mobile'} • IP: {session.ip_address}
                      </div>
                    </div>
                  </div>
                  <ShieldCheck size={18} className="text-green-500" />
                </div>
              )) : (
                <p className="text-gray-400 text-sm">No recent login sessions found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
