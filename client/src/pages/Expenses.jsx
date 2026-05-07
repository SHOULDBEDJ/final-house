import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  Pencil, 
  Trash2, 
  ListIcon,
  Wallet,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StatCard = ({ icon, value, label, accent, isRed }) => (
  <div className={`card stat-card ${accent ? `accent-${accent}` : ''}`} style={{ padding: '20px' }}>
    <div className="stat-icon-circle" style={{ backgroundColor: isRed ? 'rgba(220, 53, 69, 0.1)' : accent === 'pending' ? 'rgba(196, 146, 11, 0.1)' : 'rgba(25, 135, 84, 0.1)', color: isRed ? '#DC3545' : accent === 'pending' ? '#C4920B' : '#198754' }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="number" style={{ fontSize: '24px', color: isRed ? '#DC3545' : 'inherit' }}>{value}</span>
      <span className="label-caps">{label}</span>
    </div>
  </div>
);

const Expenses = () => {
  const [expenseList, setExpenseList] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    amount: 0,
    payment_mode: 'UPI',
    vendor: '',
    reference: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      const query = new URLSearchParams({
        type: typeFilter,
        from: dateFrom,
        to: dateTo,
        search: search
      }).toString();

      const [listRes, summaryRes, typesRes] = await Promise.all([
        api.get(`/expenses?${query}`),
        api.get('/api/expenses/summary'),
        api.get('/api/settings/expense-types')
      ]);

      setExpenseList(listRes.data);
      setSummary(summaryRes.data);
      setExpenseTypes(typesRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load expense data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, typeFilter, dateFrom, dateTo]);

  const filteredTotal = useMemo(() => {
    return expenseList.reduce((sum, item) => sum + item.amount, 0);
  }, [expenseList]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedExpense) {
        await api.put(`/api/expenses/${selectedExpense.id}`, formData);
        toast.success('Expense record updated');
      } else {
        await api.post('/api/expenses', formData);
        toast.success('Expense record added');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Error saving expense record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense record? This cannot be undone.')) {
      try {
        await api.delete(`/api/expenses/${id}`);
        toast.success('Expense record deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const getBadgeStyles = (type) => {
    switch (type) {
      case 'Maintenance': return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
      case 'Utilities': return { bg: '#DBEAFE', text: '#1E3A8A', border: 'transparent' };
      case 'Salaries': return { bg: '#D1FAE5', text: '#065F46', border: 'transparent' };
      default: return { bg: '#F3F4F6', text: '#374151', border: 'transparent' };
    }
  };

  return (
    <div className="expenses-page">
      {/* CHECK 1: Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Receipt size={26} color="#C4920B" />
            <h1 style={{ margin: 0 }}>Expenses</h1>
          </div>
          <p className="subtitle">Track all expenditures</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedExpense(null); setFormData({ date: new Date().toISOString().split('T')[0], type: expenseTypes[0] || '', amount: 0, payment_mode: 'UPI', vendor: '', reference: '', description: '' }); setShowModal(true); }}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* CHECK 2: Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Receipt size={24} />} value={`₹${summary.total.toLocaleString()}`} label="Total Expenses" isRed={true} accent="financial" style={{ borderLeft: '4px solid #DC3545' }} />
        <StatCard icon={<ListIcon size={24} />} value={summary.count} label="Total Records" accent="pending" />
        <StatCard icon={<Wallet size={24} />} value={`₹${filteredTotal.toLocaleString()}`} label="Filtered Amount" isRed={true} />
      </div>

      {/* CHECK 3: Filter Bar */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="input-with-icon" style={{ width: '320px' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search vendor, description..." 
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select style={{ width: '180px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All Types</option>
            {expenseTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <button className="btn-danger" style={{ padding: '8px 16px', borderRadius: '6px' }} onClick={() => { setSearch(''); setTypeFilter('All Types'); setDateFrom(''); setDateTo(''); }}>
            Clear
          </button>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button className={viewMode === 'table' ? 'btn-amber-toggle' : 'btn-inactive-toggle'} onClick={() => setViewMode('table')}>
              <List size={16} /> Table
            </button>
            <button className={viewMode === 'cards' ? 'btn-amber-toggle' : 'btn-inactive-toggle'} onClick={() => setViewMode('cards')}>
              <Grid size={16} /> Cards
            </button>
          </div>
          <span style={{ fontSize: '13px', color: '#888' }}>{expenseList.length} results found</span>
        </div>
      </div>

      {/* CHECK 4: Table */}
      {viewMode === 'table' ? (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>VENDOR / DESCRIPTION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {expenseList.map(item => {
                  const style = getBadgeStyles(item.type);
                  return (
                    <tr key={item.id}>
                      <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: style.bg, color: style.text, border: style.border !== 'transparent' ? `1px solid ${style.border}` : 'none', borderRadius: '20px' }}>
                          {item.type || 'Other'}
                        </span>
                      </td>
                      <td style={{ color: '#DC3545', fontWeight: 600 }}>₹{item.amount.toLocaleString()}</td>
                      <td>{item.payment_mode}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.vendor || '—'}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{item.description}</div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-action-circle" onClick={() => { setSelectedExpense(item); setFormData(item); setShowModal(true); }}><Pencil size={14} /></button>
                          <button className="btn-action-circle" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#F8F7F2', fontWeight: 600 }}>
                  <td colSpan="2">{expenseList.length} records</td>
                  <td colSpan="4" style={{ textAlign: 'right', color: '#DC3545' }}>Total: ₹{filteredTotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {expenseList.map(item => {
            const style = getBadgeStyles(item.type);
            return (
              <div key={item.id} className="card p-4">
                <div className="flex justify-between mb-3">
                  <span style={{ fontSize: '12px', color: '#888' }}>{new Date(item.date).toLocaleDateString('en-GB')}</span>
                  <span className="badge" style={{ backgroundColor: style.bg, color: style.text }}>{item.type}</span>
                </div>
                <div className="mb-4">
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#DC3545' }}>₹{item.amount.toLocaleString()}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>{item.vendor}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{item.payment_mode} | {item.reference || 'No Ref'}</div>
                </div>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>{item.description}</p>
                <div className="flex gap-2 border-t pt-3">
                  <button className="btn-action-circle" onClick={() => { setSelectedExpense(item); setFormData(item); setShowModal(true); }}><Pencil size={14} /></button>
                  <button className="btn-action-circle" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CHECK 5-6: Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{selectedExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Expense Type</label>
                  <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="">Select Type</option>
                    {expenseTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount ₹ *</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select value={formData.payment_mode} onChange={(e) => setFormData({...formData, payment_mode: e.target.value})}>
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>NEFT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vendor / Paid To</label>
                  <input type="text" placeholder="Vendor name" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Reference ID</label>
                  <input type="text" placeholder="Optional" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                </div>
                <div className="form-group form-full">
                  <label>Description</label>
                  <textarea rows="3" placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
              </div>

              <div className="modal-footer flex justify-end gap-3 mt-6">
                <button type="button" className="btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
