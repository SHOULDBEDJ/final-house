import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  CheckCircle2
} from 'lucide-react';

const StatCard = ({ title, value, icon, accent, trend }) => (
  <div className={`card stat-card accent-${accent}`}>
    <div className="stat-icon-circle" style={{ 
      backgroundColor: accent === 'amber' ? 'rgba(196, 146, 11, 0.1)' : 'rgba(25, 135, 84, 0.1)',
      color: accent === 'amber' ? 'var(--amber)' : 'var(--green)'
    }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="number">{value}</span>
      <span className="label">{title}</span>
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
      <div className="mb-6">
        <h1>Dashboard Overview</h1>
        <p className="subtitle">Real-time statistics for THE 16 EYES Farm House</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StatCard 
          title="TOTAL BOOKINGS" 
          value={stats.totalBookings} 
          icon={<CalendarDays size={20} />} 
          accent="amber"
          trend={12}
        />
        <StatCard 
          title="CONFIRMED" 
          value={stats.totalBookings - stats.pendingBookings} 
          icon={<CheckCircle2 size={20} />} 
          accent="green"
        />
        <StatCard 
          title="TOTAL REVENUE" 
          value={`₹${stats.totalIncome.toLocaleString()}`} 
          icon={<TrendingUp size={20} />} 
          accent="green"
          trend={8}
        />
        <StatCard 
          title="PENDING PAYMENTS" 
          value={stats.pendingBookings} 
          icon={<Clock size={20} />} 
          accent="amber"
        />
      </div>

      <div className="grid mt-6" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Activity</h2>
            <button className="btn-amber" style={{ fontSize: '12px' }}>View All</button>
          </div>
          <div className="flex flex-col gap-4">
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              No recent activity found.
            </p>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <button className="btn-primary w-full" style={{ padding: '12px' }}>
              <span style={{ fontSize: '18px' }}>+</span> NEW BOOKING
            </button>
            <button className="btn-primary w-full" style={{ padding: '12px', background: 'transparent', border: '1px solid var(--navy)', color: 'var(--navy)' }}>
              RECORD INCOME
            </button>
            <button className="btn-danger w-full" style={{ padding: '12px' }}>
              ADD EXPENSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
