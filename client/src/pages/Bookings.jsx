import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  Eye, 
  Pencil, 
  Check, 
  MessageSquare, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ListIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Wallet,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const SummaryCard = ({ icon, value, label, accent, fullWidth }) => (
  <div className={`card stat-card ${accent ? `accent-${accent}` : ''}`} style={{ width: fullWidth ? '100%' : 'auto', padding: '20px' }}>
    <div className="stat-icon-circle" style={{ backgroundColor: accent === 'pending' ? 'rgba(196, 146, 11, 0.1)' : 'rgba(25, 135, 84, 0.1)', color: accent === 'pending' ? '#C4920B' : '#198754' }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="number" style={{ fontSize: '24px' }}>{value}</span>
      <span className="label-caps">{label}</span>
    </div>
  </div>
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ total: 0, confirmed: 0, pendingBalance: 0, advanceCollected: 0, totalIncome: 0, cashInHand: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const location = useLocation();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    check_in: '',
    slot_id: '',
    guests: 1,
    id_proof_type: 'Aadhaar',
    id_number: '',
    total_amount: 0,
    advance_paid: 0,
    discount: 0,
    notes: ''
  });

  const fetchBookings = async () => {
    try {
      const [bookingsRes, summaryRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/bookings/summary')
      ]);
      setBookings(bookingsRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Handle redirect from dashboard
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      const date = params.get('date');
      setFormData(prev => ({ ...prev, check_in: date || '' }));
      setShowModal(true);
    }
  }, [location]);

  // Dynamic Availability Check (Check 6)
  useEffect(() => {
    if (formData.check_in) {
      api.get(`/bookings/availability?date=${formData.check_in}`).then(res => {
        setAvailableSlots(res.data.slots);
      });
    }
  }, [formData.check_in]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                           b.customer_phone.includes(search) ||
                           `16EYE${b.id}`.includes(search);
      const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesDateFrom = !dateFrom || b.check_in >= dateFrom;
      const matchesDateTo = !dateTo || b.check_in <= dateTo;
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [bookings, search, statusFilter, dateFrom, dateTo]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const handleSave = async (e) => {
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
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error saving booking');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/api/bookings/${id}/confirm`);
      toast.success('Booking confirmed');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to confirm');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        toast.success('Booking deleted');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#C4920B', '#198754', '#1C2D5E', '#8B1717', '#3B82F6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bookings-page">
      {/* CHECK 1: Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Calendar size={26} color="#C4920B" />
            <h1 style={{ margin: 0 }}>Bookings</h1>
          </div>
          <p className="subtitle">Manage all the Farm House bookings</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedBooking(null); setIsReadOnly(false); setShowModal(true); }}>
          <Plus size={18} /> Add Booking
        </button>
      </div>

      {/* CHECK 2: Stats Summary Row */}
      <div className="grid gap-6 mb-8">
        <div className="grid grid-cols-2 gap-6">
          <SummaryCard icon={<ListIcon size={24} />} value={summary.total} label="Total Bookings" accent="pending" />
          <SummaryCard icon={<CheckCircle2 size={24} />} value={summary.confirmed} label="Confirmed" accent="financial" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          <SummaryCard icon={<Clock size={24} />} value={`₹${summary.pendingBalance.toLocaleString()}`} label="Pending Balance" accent="pending" />
          <SummaryCard icon={<CreditCard size={24} />} value={`₹${summary.advanceCollected.toLocaleString()}`} label="Advance Collected" accent="financial" />
          <SummaryCard icon={<DollarSign size={24} />} value={`₹${summary.totalIncome.toLocaleString()}`} label="Total Income" accent="financial" />
          <SummaryCard icon={<Wallet size={24} />} value={`₹${summary.cashInHand.toLocaleString()}`} label="Balance / Cash In Hand" accent="pending" />
        </div>
      </div>

      {/* CHECK 3: Filter Bar */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="input-with-icon" style={{ width: '320px' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
          <button className="btn-danger" style={{ padding: '8px 16px', borderRadius: '6px' }} onClick={() => { setSearch(''); setStatusFilter('All'); setDateFrom(''); setDateTo(''); }}>
            Clear
          </button>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button className={viewMode === 'table' ? 'btn-amber-toggle' : 'btn-inactive-toggle'} style={{ border: 'none' }} onClick={() => setViewMode('table')}>
              <List size={16} /> Table
            </button>
            <button className={viewMode === 'cards' ? 'btn-amber-toggle' : 'btn-inactive-toggle'} style={{ border: 'none' }} onClick={() => setViewMode('cards')}>
              <Grid size={16} /> Cards
            </button>
          </div>
          <span style={{ fontSize: '13px', color: '#888' }}>{filteredBookings.length} results found</span>
        </div>
      </div>

      {/* CHECK 4 & 9: Content (Table or Cards) */}
      {viewMode === 'table' ? (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>DATE & SLOT</th>
                  <th>GUESTS</th>
                  <th>AGREED</th>
                  <th>ADVANCE</th>
                  <th>BALANCE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map(b => (
                  <tr key={b.id}>
                    <td><span className="order-link">16EYE{String(b.id).padStart(2, '0')}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="user-avatar" style={{ backgroundColor: getAvatarColor(b.customer_name), width: '34px', height: '34px', fontSize: '13px' }}>
                          {b.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span style={{ fontWeight: 600 }}>{b.customer_name}</span>
                          <span style={{ fontSize: '11px', color: '#888' }}>{b.customer_phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{new Date(b.check_in).toLocaleDateString('en-GB')}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{b.slot_name || 'Full Day'}</div>
                    </td>
                    <td className="text-center">{b.guests || 1}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>₹{b.total_amount.toLocaleString()}</td>
                    <td style={{ color: b.advance_paid > 0 ? 'var(--green)' : '#888' }}>₹{b.advance_paid.toLocaleString()}</td>
                    <td>
                      {b.total_amount - b.advance_paid - (b.discount || 0) > 0 ? (
                        <span className="balance-red">₹{(b.total_amount - b.advance_paid - (b.discount || 0)).toLocaleString()}</span>
                      ) : (
                        <span className="advance-green">✓ Paid</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-action-circle" title="View" onClick={() => { setSelectedBooking(b); setIsReadOnly(true); setFormData(b); setShowModal(true); }}><Eye size={14} /></button>
                        <button className="btn-action-circle" title="Edit" onClick={() => { setSelectedBooking(b); setIsReadOnly(false); setFormData(b); setShowModal(true); }}><Pencil size={14} /></button>
                        {b.status === 'pending' && <button className="btn-action-circle" title="Confirm" onClick={() => handleConfirm(b.id)}><Check size={14} /></button>}
                        <button className="btn-action-circle" title="Message" onClick={() => window.open(`https://wa.me/91${b.customer_phone}`, '_blank')}><MessageSquare size={14} /></button>
                        <button className="btn-action-circle" title="Delete" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span style={{ fontSize: '13px', color: '#888' }}>Showing {paginatedBookings.length} of {filteredBookings.length}</span>
            <div className="flex gap-2">
              <button className="btn-inactive-toggle" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></button>
              <button className="btn-amber-toggle">{currentPage}</button>
              <button className="btn-inactive-toggle" disabled={paginatedBookings.length < itemsPerPage} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredBookings.map(b => (
            <div key={b.id} className="card p-4">
              <div className="flex justify-between mb-4">
                <span className="order-link">16EYE{String(b.id).padStart(2, '0')}</span>
                <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status.toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <span style={{ fontWeight: 600 }}>{b.customer_name}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{b.customer_phone}</span>
                <div style={{ fontSize: '13px' }}>
                  <Calendar size={14} className="inline mr-1" /> {new Date(b.check_in).toLocaleDateString('en-GB')} ({b.slot_name || 'Full Day'})
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>₹{b.total_amount.toLocaleString()}</span>
                <div className="flex gap-2">
                  <button className="btn-action-circle" onClick={() => { setSelectedBooking(b); setIsReadOnly(false); setFormData(b); setShowModal(true); }}><Pencil size={14} /></button>
                  <button className="btn-action-circle" onClick={() => window.open(`https://wa.me/91${b.customer_phone}`, '_blank')}><MessageSquare size={14} /></button>
                  <button className="btn-action-circle" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHECK 5-8: Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px', padding: '28px' }}>
            <div className="modal-header">
              <h2>{isReadOnly ? 'Booking Details' : selectedBooking ? 'Edit Booking' : '+ Add New Booking'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-grid">
                {/* Check 6: Date & Slot */}
                <div className="form-group">
                  <label>BOOKING DATE *</label>
                  <input type="date" required value={formData.check_in} disabled={isReadOnly} onChange={(e) => setFormData({...formData, check_in: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>TIME SLOT *</label>
                  <div className="flex gap-2">
                    <select required value={formData.slot_id} disabled={isReadOnly} onChange={(e) => setFormData({...formData, slot_id: e.target.value})}>
                      <option value="">Select Slot</option>
                      {availableSlots.map(s => (
                        <option key={s.slotId} value={s.slotId} disabled={!s.available}>
                          {s.slotName} {!s.available ? '(Booked)' : ''}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn-action-circle"><Plus size={14} /></button>
                  </div>
                  {formData.check_in && (
                    <p style={{ fontSize: '11px', marginTop: '4px', color: availableSlots.filter(s => s.available).length > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {availableSlots.filter(s => s.available).length} of {availableSlots.length} slots available
                    </p>
                  )}
                </div>

                {/* Check 7: Other Fields */}
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Customer name" required disabled={isReadOnly} value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" disabled={isReadOnly} value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>ID Proof Type</label>
                  <select disabled={isReadOnly} value={formData.id_proof_type} onChange={(e) => setFormData({...formData, id_proof_type: e.target.value})}>
                    <option>Aadhaar</option>
                    <option>PAN</option>
                    <option>Passport</option>
                    <option>Driving License</option>
                    <option>Voter ID</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ID Number</label>
                  <input type="text" disabled={isReadOnly} value={formData.id_number} onChange={(e) => setFormData({...formData, id_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Number of Guests</label>
                  <input type="number" min="1" disabled={isReadOnly} value={formData.guests} onChange={(e) => setFormData({...formData, guests: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Agreed Total ₹ *</label>
                  <input type="number" required disabled={isReadOnly} value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Advance Paid ₹</label>
                  <input type="number" disabled={isReadOnly} value={formData.advance_paid} onChange={(e) => setFormData({...formData, advance_paid: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Discount Amount ₹</label>
                  <input type="number" disabled={isReadOnly} value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Remaining Balance ₹ (Read-Only)</label>
                  <input type="number" readOnly className="bg-gray-100" value={formData.total_amount - formData.advance_paid - (formData.discount || 0)} />
                </div>
                <div className="form-group form-full">
                  <label>Notes</label>
                  <textarea rows="3" disabled={isReadOnly} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
              </div>

              <div className="modal-footer flex justify-end gap-3 mt-6">
                <button type="button" className="btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
                {!isReadOnly && <button type="submit" className="btn-primary">Save Booking</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
