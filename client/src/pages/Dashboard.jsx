import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="card glass">
    <div className="flex justify-between items-center mb-4">
      <div style={{ 
        padding: '0.75rem', 
        backgroundColor: `${color}20`, 
        borderRadius: 'var(--radius)',
        color: color
      }}>
        {icon}
      </div>
      {trend && (
        <span className="flex items-center gap-1" style={{ 
          fontSize: '0.75rem', 
          color: trend > 0 ? 'var(--success)' : 'var(--error)' 
        }}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{title}</h3>
    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalIncome: 0,
    totalExpenses: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Admin</p>
      </div>

      <div className="grid">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={<CalendarDays size={24} />} 
          color="#6366f1"
          trend={12}
        />
        <StatCard 
          title="Total Income" 
          value={`₹${stats.totalIncome}`} 
          icon={<TrendingUp size={24} />} 
          color="#10b981"
          trend={8}
        />
        <StatCard 
          title="Total Expenses" 
          value={`₹${stats.totalExpenses}`} 
          icon={<TrendingDown size={24} />} 
          color="#ef4444"
          trend={-5}
        />
        <StatCard 
          title="Pending Bookings" 
          value={stats.pendingBookings} 
          icon={<Clock size={24} />} 
          color="#f59e0b"
        />
      </div>

      <div className="grid mt-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card glass">
          <div className="flex justify-between items-center mb-4">
            <h2>Recent Activity</h2>
            <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>View All</button>
          </div>
          <div className="flex flex-col gap-4">
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No recent activity found.
            </p>
          </div>
        </div>

        <div className="card glass">
          <h2>Quick Actions</h2>
          <div className="flex flex-col gap-2 mt-4">
            <button className="btn-primary w-full">New Booking</button>
            <button className="btn-outline w-full">Add Expense</button>
            <button className="btn-outline w-full">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
