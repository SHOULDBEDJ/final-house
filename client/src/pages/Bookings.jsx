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
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    check_in: '',
    check_out: '',
    total_amount: '',
    advance_paid: '',
    notes: ''
  });

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        toast.success('Booking deleted');
        fetchBookings();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const downloadPDF = async (id) => {
    try {
      const response = await api.get(`/bookings/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error('PDF download failed');
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

  const openQR = (booking) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Bookings</h1>
        <button className="btn-primary" onClick={() => { setSelectedBooking(null); setShowModal(true); }}>
          <Plus size={20} /> New Booking
        </button>
      </div>

      <div className="card glass">
        <div className="flex items-center gap-2 mb-4">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search bookings..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>

        {loading ? (
          <p className="text-center p-4">Loading bookings...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <strong>{booking.customer_name}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.customer_phone}</p>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>₹{booking.total_amount}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Paid: ₹{booking.advance_paid}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => handleEdit(booking)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => openQR(booking)} title="QR Code">
                          <QrCode size={16} />
                        </button>
                        <button className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => downloadPDF(booking.id)} title="Download PDF">
                          <Download size={16} />
                        </button>
                        <button className="btn-outline" style={{ padding: '0.5rem', color: 'var(--error)' }} onClick={() => handleDelete(booking.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)} 
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent' }}
            >
              <X size={24} />
            </button>
            <h2 className="mb-4">{selectedBooking ? 'Edit Booking' : 'New Booking'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="mb-4">
                  <label className="mb-2 block">Customer Name</label>
                  <input 
                    type="text" 
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required 
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block">Customer Phone</label>
                  <input 
                    type="text" 
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="mb-4">
                  <label className="mb-2 block">Check-in Date</label>
                  <input 
                    type="date" 
                    value={formData.check_in}
                    onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                    required 
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block">Check-out Date</label>
                  <input 
                    type="date" 
                    value={formData.check_out}
                    onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="mb-4">
                  <label className="mb-2 block">Total Amount</label>
                  <input 
                    type="number" 
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                    required 
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block">Advance Paid</label>
                  <input 
                    type="number" 
                    value={formData.advance_paid}
                    onChange={(e) => setFormData({...formData, advance_paid: e.target.value})}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-2 block">Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                ></textarea>
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                {selectedBooking ? 'Update Booking' : 'Create Booking'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <button 
              onClick={() => setShowQRModal(false)} 
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent' }}
            >
              <X size={24} />
            </button>
            <h2 className="mb-4">Payment QR Code</h2>
            <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', display: 'inline-block' }}>
              <QRCodeSVG 
                value={`upi://pay?pa=your-upi-id@bank&pn=16Eyes&am=${selectedBooking.total_amount - selectedBooking.advance_paid}&cu=INR`} 
                size={256}
              />
            </div>
            <div className="mt-4">
              <p>Amount to Pay: <strong>₹{selectedBooking.total_amount - selectedBooking.advance_paid}</strong></p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Scan with any UPI App</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
