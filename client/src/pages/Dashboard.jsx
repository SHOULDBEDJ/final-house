import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Grid,
  List,
  User,
  Zap,
  Layout,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, accent }) => (
  <div className="card stat-card" style={{ borderLeft: `4px solid ${accent}` }}>
    <div className="stat-icon-circle" style={{ backgroundColor: `${accent}15`, color: accent }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="number">{value}</span>
      <span className="label-caps">{title}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    monthlyBookings: 0,
    weeklyBookings: 0,
    upcomingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/bookings?limit=5')
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const fetchMonthAvailability = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const availabilityData = {};
    const promises = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      promises.push(
        api.get(`/bookings/availability?date=${dateStr}`).then(res => {
          availabilityData[dateStr] = res.data.slots;
        })
      );
    }

    await Promise.all(promises);
    setAvailability(availabilityData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchMonthAvailability();
  }, [currentDate]);

  const handleCellClick = (dateStr) => {
    // CHECK 6: Click to book - Navigate to bookings with pre-filled date
    navigate(`/bookings?date=${dateStr}&action=new`);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Header
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day padding"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const slots = availability[dateStr] || [];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const allBooked = slots.length > 0 && slots.every(s => !s.available);
      const allAvailable = slots.length > 0 && slots.every(s => s.available);

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${allBooked ? 'fully-booked' : ''}`}
          onClick={() => handleCellClick(dateStr)}
          style={{ cursor: 'pointer' }}
        >
          <span className="day-number">{day}</span>
          <div className="slot-pills">
            {allAvailable ? (
              <span className="slot-status-text available">Available</span>
            ) : allBooked ? (
              <span className="slot-status-text booked">Booked</span>
            ) : (
              slots.map(slot => (
                <div 
                  key={slot.slotId} 
                  className={`slot-pill ${slot.available ? 'available' : 'booked'}`}
                  style={{ backgroundColor: slot.available ? slot.color : '#eee' }}
                  title={`${slot.slotName}: ${slot.available ? 'Available' : 'Booked'}`}
                ></div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-grid">
        {weekDays.map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
        {days}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Calendar Section */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Monthly Calendar</h2>
            <div className="flex items-center gap-2">
              <button className="btn-icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontWeight: 600, minWidth: '100px', textAlign: 'center' }}>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button className="btn-icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                <ChevronRight size={16} />
              </button>
            </div>
            <button className="btn-inactive-toggle" onClick={() => setCurrentDate(new Date())}>Today</button>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button className="btn-amber-toggle" style={{ padding: '6px 16px' }}>Month</button>
            <button className="btn-inactive-toggle" style={{ border: 'none', background: 'transparent' }}>Week</button>
            <button className="btn-inactive-toggle" style={{ border: 'none', background: 'transparent' }}>Day</button>
          </div>
        </div>

        {renderCalendar()}

        {/* Legend */}
        <div className="flex gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-2"><div className="dot" style={{ background: '#198754' }}></div> <span style={{ fontSize: '12px' }}>Morng Slot</span></div>
          <div className="flex items-center gap-2"><div className="dot" style={{ background: '#C4920B' }}></div> <span style={{ fontSize: '12px' }}>Eve to Eve</span></div>
          <div className="flex items-center gap-2"><div className="dot" style={{ background: '#1C2D5E' }}></div> <span style={{ fontSize: '12px' }}>Photoshoot</span></div>
          <div className="flex items-center gap-2"><div className="dot" style={{ background: '#3B82F6' }}></div> <span style={{ fontSize: '12px' }}>Eve Slot</span></div>
          <div className="flex items-center gap-2"><div className="dot" style={{ background: '#DC3545' }}></div> <span style={{ fontSize: '12px' }}>Full day</span></div>
        </div>
      </div>

      {/* Stats Cards (Check 7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={<Layout size={20} />} accent="var(--navy)" />
        <StatCard title="Today's Bookings" value={stats.todayBookings} icon={<CalendarDays size={20} />} accent="var(--navy)" />
        <StatCard title="Monthly Bookings" value={stats.monthlyBookings} icon={<TrendingUp size={20} />} accent="var(--navy)" />
        <StatCard title="This Week's Bookings" value={stats.weeklyBookings} icon={<CheckCircle size={20} />} accent="var(--navy)" />
      </div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <StatCard title="Upcoming Bookings" value={stats.upcomingBookings} icon={<Clock size={20} />} accent="var(--navy)" />
      </div>

      {/* Quick Actions (Check 8) */}
      <div className="flex gap-4 mb-8">
        <button className="btn-primary" onClick={() => navigate('/bookings?action=new')}><Plus size={16} /> Add Booking</button>
        <button className="btn-primary" style={{ background: '#198754' }} onClick={() => navigate('/income?action=new')}><Plus size={16} /> Add Income</button>
        <button className="btn-danger" onClick={() => navigate('/expenses?action=new')}><Plus size={16} /> Add Expense</button>
        <button className="btn-inactive-toggle" style={{ padding: '10px 20px' }} onClick={() => navigate('/bookings')}>Full Calendar</button>
        <button className="btn-inactive-toggle" style={{ padding: '10px 20px' }} onClick={() => navigate('/reports')}>Report</button>
      </div>

      {/* Recent Bookings Table (Check 9) */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Bookings</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Grid size={18} style={{ color: 'var(--amber)' }} />
              <List size={18} style={{ color: '#ccc' }} />
            </div>
            <a href="/bookings" style={{ color: 'var(--amber)', fontSize: '14px', fontWeight: 500 }}>View All</a>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>DATE & SLOT</th>
                <th>AGREED</th>
                <th>BALANCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td><a href={`/bookings/${booking.id}`} className="order-link">16EYE{String(booking.id).padStart(2, '0')}</a></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
                        {booking.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{booking.customer_name}</span>
                    </div>
                  </td>
                  <td>
                    <div>{new Date(booking.check_in).toLocaleDateString('en-GB')}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{booking.slot_name || 'Full Day'}</div>
                  </td>
                  <td style={{ color: 'var(--green)', fontWeight: 600 }}>₹{booking.total_amount.toLocaleString()}</td>
                  <td>
                    {booking.total_amount - booking.advance_paid > 0 ? (
                      <span className="balance-red">₹{(booking.total_amount - booking.advance_paid).toLocaleString()}</span>
                    ) : (
                      <span className="advance-green">✓ Paid</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${booking.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
