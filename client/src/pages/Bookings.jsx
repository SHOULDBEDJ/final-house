import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  X,
  QrCode,
  Eye,
  Check,
  MessageSquare
} from 'lucide-react';

import { useLocation } from 'react-router-dom';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const location = useLocation();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    check_in: '',
    check_out: '',
    total_amount: '',
    advance_paid: '',
    notes: ''
  });

  // Handle click-to-book from dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const date = params.get('date');
    const action = params.get('action');

    if (action === 'new') {
      setSelectedBooking(null);
      setFormData(prev => ({
        ...prev,
        check_in: date || '',
        check_out: date || ''
      }));
      setShowModal(true);
    }
  }, [location]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBooking) {
        await api.put(`/bookings/${selectedBooking.id}`, formData);
        toast.success('Booking updated');
      } else {
        await api.post('/bookings', formData);
        toast.success('Booking created');
      }
      setShowModal(false);
      setSelectedBooking(null);
      setFormData({ customer_name: '', customer_phone: '', check_in: '', check_out: '', total_amount: '', advance_paid: '', notes: '' });
      fetchBookings();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      check_in: booking.check_in.split('T')[0],
      check_out: booking.check_out.split('T')[0],
      total_amount: booking.total_amount,
      advance_paid: booking.advance_paid,
      notes: booking.notes || ''
    });
    setShowModal(true);
  };

  const getInitialsColor = (name) => {
    const colors = ['#1C2D5E', '#C4920B', '#198754', '#8B1717'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Bookings</h1>
          <p className="subtitle">Manage and track guest reservations and payments</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedBooking(null); setShowModal(true); }}>
          <Plus size={18} /> NEW BOOKING
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              style={{ paddingLeft: '40px', backgroundColor: '#F0EEE9' }} 
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center p-8">Loading bookings...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>BOOKING ID</th>
                  <th>DATES</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{ 
                          width: '34px', height: '34px', borderRadius: '50%', 
                          backgroundColor: getInitialsColor(booking.customer_name),
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 500
                        }}>
                          {booking.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{booking.customer_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{booking.customer_phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href="#" className="order-link">#{1000 + booking.id}</a>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        {new Date(booking.check_in).toLocaleDateString('en-GB')} - {new Date(booking.check_out).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>₹{booking.total_amount.toLocaleString()}</div>
                        <div className="advance-green" style={{ fontSize: '11px' }}>Paid: ₹{booking.advance_paid.toLocaleString()}</div>
                        {booking.total_amount - booking.advance_paid > 0 && (
                          <div className="balance-red" style={{ fontSize: '11px' }}>Due: ₹{(booking.total_amount - booking.advance_paid).toLocaleString()}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${booking.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-action-circle" title="View"><Eye size={14} /></button>
                        <button className="btn-action-circle" onClick={() => handleEdit(booking)} title="Edit"><Edit2 size={14} /></button>
                        <button className="btn-action-circle" title="Confirm"><Check size={14} /></button>
                        <button className="btn-action-circle" title="Message"><MessageSquare size={14} /></button>
                        <button className="btn-action-circle" style={{ color: 'var(--danger)' }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{selectedBooking ? 'Edit Booking' : 'New Booking'}</h2>
              <X className="modal-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input 
                    type="text" 
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Customer Phone</label>
                  <input 
                    type="text" 
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input 
                    type="date" 
                    value={formData.check_in}
                    onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Check-out Date</label>
                  <input 
                    type="date" 
                    value={formData.check_out}
                    onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Advance Paid (₹)</label>
                  <input 
                    type="number" 
                    value={formData.advance_paid}
                    onChange={(e) => setFormData({...formData, advance_paid: e.target.value})}
                  />
                </div>
                <div className="form-group form-full">
                  <label>Additional Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    style={{ height: 'auto', padding: '12px' }}
                  ></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-danger" style={{ padding: '10px 24px' }} onClick={() => setShowModal(false)}>CANCEL</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>SAVE BOOKING</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
