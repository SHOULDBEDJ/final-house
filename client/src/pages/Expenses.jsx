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
      toast.success('Expense recorded');
      setShowModal(false);
      setFormData({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast.error('Failed to record expense');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Expenses</h1>
        <button className="btn-primary" style={{ backgroundColor: 'var(--error)' }} onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Expense
        </button>
      </div>

      <div className="card glass">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td><span className="badge badge-cancelled">{item.category}</span></td>
                  <td>{item.description}</td>
                  <td style={{ color: 'var(--error)', fontWeight: 'bold' }}>-₹{item.amount}</td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="text-center">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '450px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2>Add Expense</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="mb-2 block">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Select Category</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Salary">Salary</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-2 block">Amount</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
              </div>
              <div className="mb-4">
                <label className="mb-2 block">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3}></textarea>
              </div>
              <button type="submit" className="btn-primary w-full justify-center" style={{ backgroundColor: 'var(--error)' }}>Record Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
