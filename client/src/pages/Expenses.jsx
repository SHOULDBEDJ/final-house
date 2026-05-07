import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import { Plus, X, TrendingDown } from 'lucide-react';

const Expenses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const response = await api.get('/expenses');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
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
      await api.post('/expenses', formData);
      toast.success('Expense record saved');
      setShowModal(false);
      setFormData({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast.error('Failed to save record');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Expenses</h1>
          <p className="subtitle">Monitor and manage farmhouse operational costs</p>
        </div>
        <button className="btn-danger" onClick={() => setShowModal(true)}>
          <Plus size={18} /> RECORD EXPENSE
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                  <td><span className="badge badge-pending">{item.category.toUpperCase()}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.description}</td>
                  <td className="balance-red">-₹{item.amount.toLocaleString()}</td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: '40px' }}>No expense records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Record Expense</h2>
              <X className="modal-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Select Category</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Electricity">Electricity & Bills</option>
                  <option value="Salary">Staff Salary</option>
                  <option value="Cleaning">Cleaning & Supplies</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} style={{ height: 'auto', padding: '12px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-inactive-toggle" onClick={() => setShowModal(false)}>CANCEL</button>
                <button type="submit" className="btn-danger">SAVE RECORD</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
