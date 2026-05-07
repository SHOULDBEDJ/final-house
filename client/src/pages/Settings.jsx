import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Home, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Image as ImageIcon, 
  RotateCcw, 
  DollarSign, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [identity, setIdentity] = useState({ house_name: '', phone: '', email: '', address: '', logo: '' });
  const [slots, setSlots] = useState([]);
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Slot Form
  const [newSlot, setNewSlot] = useState({ name: '', startTime: '', endTime: '', color: '#1C2D5E' });
  // New Income Type
  const [newIncomeType, setNewIncomeType] = useState('');

  const fetchData = async () => {
    try {
      const [idRes, slotsRes, typesRes] = await Promise.all([
        api.get('/settings/identity'),
        api.get('/settings/time-slots'),
        api.get('/settings/income-types')
      ]);
      setIdentity(idRes.data);
      setSlots(slotsRes.data);
      setIncomeTypes(typesRes.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIdentitySave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings/identity', identity);
      toast.success('Identity updated');
    } catch (error) {
      toast.error('Failed to save identity');
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.name || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Please fill all required slot fields');
      return;
    }

    const [sH, sM] = newSlot.startTime.split(':').map(Number);
    const [eH, eM] = newSlot.endTime.split(':').map(Number);
    const crossesMidnight = (eH * 60 + eM) < (sH * 60 + sM);

    try {
      await api.post('/settings/time-slots', { ...newSlot, crossesMidnight });
      toast.success('Time slot added');
      setNewSlot({ name: '', startTime: '', endTime: '', color: '#1C2D5E' });
      fetchData();
    } catch (error) {
      toast.error('Error adding slot');
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.delete(`/api/settings/time-slots/${id}`);
      toast.success('Slot deleted');
      fetchData();
    } catch (error) {
      if (error.response?.data?.code === 'HAS_BOOKINGS') {
        if (window.confirm(error.response.data.error)) {
           // In production, you might have a force-delete API
           toast.error('Force delete not implemented for safety');
        }
      } else {
        toast.error('Error deleting slot');
      }
    }
  };

  const handleAddIncomeType = async (e) => {
    e.preventDefault();
    if (!newIncomeType) return;
    try {
      await api.post('/settings/income-types', { name: newIncomeType });
      toast.success('Income type added');
      setNewIncomeType('');
      fetchData();
    } catch (error) {
      toast.error('Error adding income type');
    }
  };

  const handleDeleteIncomeType = async (name) => {
    try {
      // Assuming a simple delete-by-name or similar if id not present
      await api.delete(`/api/settings/income-types/${encodeURIComponent(name)}`);
      toast.success('Income type removed');
      fetchData();
    } catch (error) {
      toast.error('Error removing income type');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await api.put('/settings/identity', { logo: reader.result });
        toast.success('Logo updated');
        fetchData();
      } catch (error) {
        toast.error('Logo upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="settings-page">
      {/* CHECK 1: 2x2 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: FARMHOUSE IDENTITY */}
        <div className="card p-7">
          <div className="flex items-center gap-2 mb-6">
            <Home size={18} className="text-gray-500" />
            <span className="label-caps" style={{ color: '#555' }}>FARMHOUSE IDENTITY</span>
          </div>
          <form onSubmit={handleIdentitySave} className="space-y-4">
            <div className="form-group">
              <label>FARMHOUSE NAME</label>
              <input type="text" value={identity.house_name} onChange={(e) => setIdentity({...identity, house_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label>PHONE</label>
                <input type="tel" value={identity.phone} onChange={(e) => setIdentity({...identity, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>EMAIL</label>
                <input type="email" value={identity.email} onChange={(e) => setIdentity({...identity, email: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>ADDRESS</label>
              <textarea rows="4" value={identity.address} onChange={(e) => setIdentity({...identity, address: e.target.value})} />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={16} /> Save Identity
            </button>
          </form>
        </div>

        {/* CARD 2: TIME SLOT MANAGEMENT */}
        <div className="card p-7">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={18} className="text-gray-500" />
            <span className="label-caps" style={{ color: '#555' }}>TIME SLOT MANAGEMENT</span>
          </div>
          
          <div className="space-y-1 mb-8 max-h-[300px] overflow-y-auto">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between py-3 border-bottom group">
                <div className="flex items-center gap-3">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: slot.color }} />
                  <div className="flex flex-col">
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{slot.name}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      {slot.startTime} – {slot.endTime} {slot.crossesMidnight ? '(Next Day)' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-gray-400 hover:text-[#C4920B]"><Edit2 size={14} /></button>
                  <button className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteSlot(slot.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t">
            <span className="label-caps mb-4 block" style={{ fontSize: '11px' }}>+ ADD NEW TIME SLOT</span>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="form-group">
                <label>SLOT NAME *</label>
                <input type="text" placeholder="e.g. Morning Slot, Evening Slot..." value={newSlot.name} onChange={(e) => setNewSlot({...newSlot, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label>START TIME *</label>
                  <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>END TIME *</label>
                  <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>COLOR *</label>
                  <input type="color" style={{ height: '44px', padding: '2px' }} value={newSlot.color} onChange={(e) => setNewSlot({...newSlot, color: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Add Slot
              </button>
            </form>
          </div>
        </div>

        {/* CARD 3: OTHER INCOME TYPES */}
        <div className="card p-7">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-gray-500" />
            <span className="label-caps" style={{ color: '#555' }}>OTHER INCOME TYPES</span>
          </div>
          <p className="text-gray-400 mb-6" style={{ fontSize: '13px' }}>Manage custom categories for the Other Source of Income module</p>
          
          <form onSubmit={handleAddIncomeType} className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="New type name..." 
              className="flex-1"
              value={newIncomeType}
              onChange={(e) => setNewIncomeType(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid #1C2D5E', color: '#1C2D5E' }}>
              Add
            </button>
          </form>

          <div className="space-y-1">
            {incomeTypes.map(type => (
              <div key={type} className="flex items-center justify-between py-2 border-bottom">
                <span style={{ fontSize: '14px' }}>{type}</span>
                <button className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteIncomeType(type)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 4: LOGO MANAGEMENT */}
        <div className="card p-7">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon size={18} className="text-gray-500" />
            <span className="label-caps" style={{ color: '#555' }}>LOGO MANAGEMENT</span>
          </div>
          <p className="text-gray-400 mb-8" style={{ fontSize: '13px' }}>Update your system logo used in reports, navigation, and profile.</p>
          
          <div className="flex items-center gap-8 mb-8">
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden" style={{ width: '120px', height: '120px' }}>
              {identity.logo ? (
                <img src={identity.logo} alt="Logo" className="max-w-full max-h-full" />
              ) : (
                <ImageIcon size={40} className="text-gray-300" />
              )}
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn-primary flex items-center gap-2" onClick={() => document.getElementById('logo-upload').click()}>
                <Plus size={16} /> Upload New Logo
              </button>
              <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              <button className="btn-danger flex items-center gap-2" onClick={async () => { await api.delete('/settings/logo'); fetchData(); toast.success('Logo reset'); }}>
                <RotateCcw size={16} /> Reset Default
              </button>
            </div>
          </div>
          <p className="text-[#999]" style={{ fontSize: '11px' }}>Max size: 5MB. Supports JPG, PNG, WebP.</p>
        </div>

      </div>
    </div>
  );
};

export default Settings;
