import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import { Save, Info, Home } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    farmhouse_name: '16 Eyes Farm House',
    contact_email: 'admin@16eyes.com',
    contact_phone: '+91 9876543210',
    address: 'Near Green Valley, City',
    upi_id: '16eyes@upi'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (Object.keys(response.data).length > 0) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Configure your farmhouse identity and preferences</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          <Save size={18} /> {loading ? 'SAVING...' : 'SAVE ALL CHANGES'}
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Home size={20} style={{ color: 'var(--amber)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Farmhouse Identity</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label>Farmhouse Name</label>
              <input 
                type="text" 
                value={settings.farmhouse_name}
                onChange={(e) => setSettings({...settings, farmhouse_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>UPI ID for Payments</label>
              <input 
                type="text" 
                value={settings.upi_id}
                onChange={(e) => setSettings({...settings, upi_id: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Info size={20} style={{ color: 'var(--amber)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Contact Information</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label>Contact Email</label>
              <input 
                type="email" 
                value={settings.contact_email}
                onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input 
                type="text" 
                value={settings.contact_phone}
                onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea 
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                rows={2}
                style={{ height: 'auto', padding: '12px' }}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
