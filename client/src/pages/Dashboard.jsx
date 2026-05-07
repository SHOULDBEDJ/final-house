import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';

const StatCard = ({ title, value, icon, accent, trend }) => (
  <div className={`stat-card accent-${accent}`}>
    <div className="stat-icon-circle" style={{ 
      backgroundColor: accent === 'pending' ? 'rgba(196, 146, 11, 0.1)' : 'rgba(25, 135, 84, 0.1)',
      color: accent === 'pending' ? 'var(--amber)' : 'var(--green)'
    }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="number">{value}</span>
      <span className="label-caps" style={{ marginTop: '4px' }}>{title}</span>
    </div>
    {trend && (
      <div style={{ 
        position: 'absolute', right: '20px', top: '20px', 
        fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px',
        color: trend > 0 ? 'var(--green)' : 'var(--red)'
      }}>
        {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(trend)}%
      </div>
    )}
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
      <div className="mb-8">
        <h1>Dashboard Overview</h1>
        <p className="subtitle">Real-time business statistics for THE 16 EYES Farm House</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={<CalendarDays size={20} />} 
          accent="pending"
          trend={12}
        />
        <StatCard 
          title="Confirmed" 
          value={stats.totalBookings - stats.pendingBookings} 
          icon={<CheckCircle2 size={20} />} 
          accent="confirmed"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalIncome.toLocaleString()}`} 
          icon={<TrendingUp size={20} />} 
          accent="financial"
          trend={8}
        />
        <StatCard 
          title="Pending Payments" 
          value={stats.pendingBookings} 
          icon={<Clock size={20} />} 
          accent="pending"
        />
      </div>

      <div className="grid mt-8" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Activity</h2>
            <button className="btn-amber-toggle">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px' }}>
              No recent system activity found.
            </p>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <button className="btn-primary w-full" style={{ padding: '12px', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px' }}>+</span> NEW BOOKING
            </button>
            <button className="btn-inactive-toggle w-full" style={{ padding: '12px', justifyContent: 'center' }}>
              RECORD INCOME
            </button>
            <button className="btn-danger w-full" style={{ padding: '12px', justifyContent: 'center' }}>
              ADD EXPENSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
