import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Clock, 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  User, 
  LogIn, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  
  // Filters
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        module: moduleFilter,
        action: actionFilter,
        from: dateFrom,
        to: dateTo,
        search,
        page
      }).toString();

      const res = await api.get(`/api/activity-logs?${query}`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleFilter, actionFilter, dateFrom, dateTo, search, page]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'Login': return <LogIn size={14} className="text-blue-500" />;
      case 'Create': return <Plus size={14} className="text-green-500" />;
      case 'Edit': return <Pencil size={14} className="text-amber-500" />;
      case 'Delete': return <Trash2 size={14} className="text-red-500" />;
      default: return <Eye size={14} className="text-gray-500" />;
    }
  };

  const getModuleBadge = (module) => {
    const styles = {
      Auth: { bg: '#DBEAFE', text: '#1E3A8A' },
      Bookings: { bg: '#D1FAE5', text: '#065F46' },
      Income: { bg: '#CCFBF1', text: '#0F766E' },
      Expenses: { bg: '#FEE2E2', text: '#991B1B' },
      Users: { bg: '#EDE9FE', text: '#5B21B6' },
      Settings: { bg: '#F3F4F6', text: '#374151' }
    };
    const style = styles[module] || styles.Settings;
    return (
      <span className="badge" style={{ backgroundColor: style.bg, color: style.text, border: 'none' }}>
        {module}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="activity-log-page">
      {/* CHECK 1: Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Clock size={26} color="#C4920B" />
          <h1 style={{ margin: 0 }}>Activity Log</h1>
        </div>
        <p className="subtitle">System-wide action history</p>
      </div>

      {/* CHECK 2: Filter Bar */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="input-with-icon" style={{ width: '280px' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search detail, user..." 
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select style={{ width: '160px' }} value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}>
            <option>All Modules</option>
            <option>Auth</option>
            <option>Bookings</option>
            <option>Income</option>
            <option>Expenses</option>
            <option>Reports</option>
            <option>Users</option>
            <option>Settings</option>
          </select>
          <select style={{ width: '160px' }} value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
            <option>All Actions</option>
            <option>Login</option>
            <option>Create</option>
            <option>Edit</option>
            <option>Delete</option>
            <option>View</option>
            <option>Export</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          <button className="btn-danger" style={{ padding: '8px 16px', borderRadius: '6px' }} onClick={() => { setSearch(''); setModuleFilter('All Modules'); setActionFilter('All Actions'); setDateFrom(''); setDateTo(''); setPage(1); }}>
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
          <span style={{ fontSize: '13px', color: '#888' }}>{total} logs found</span>
        </div>
      </div>

      {/* CHECK 3: Activity Table */}
      {viewMode === 'table' ? (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ACTION</th>
                  <th>MODULE</th>
                  <th>DETAIL</th>
                  <th>USER</th>
                  <th>IP ADDRESS</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span style={{ fontWeight: 500, color: 
                          log.action === 'Login' ? '#3B82F6' : 
                          log.action === 'Create' ? '#10B981' : 
                          log.action === 'Edit' ? '#F59E0B' : 
                          log.action === 'Delete' ? '#EF4444' : '#6B7280'
                        }}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td>{getModuleBadge(log.module)}</td>
                    <td style={{ maxWidth: '300px', fontSize: '14px' }}>{log.detail}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar-circle" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                          {log.username?.substring(0, 2).toUpperCase() || 'SA'}
                        </div>
                        <span style={{ fontSize: '13px' }}>{log.username || 'SuperAdmin'}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{log.ip_address}</td>
                    <td style={{ fontSize: '13px', color: '#888' }}>
                      {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* CHECK 4: Pagination */}
          <div className="flex justify-between items-center p-6 border-t">
            <span style={{ fontSize: '13px', color: '#888' }}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} logs
            </span>
            <div className="flex gap-2">
              <button className="btn-pagination" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft size={16} /></button>
              <button className="btn-pagination" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} className={page === p ? 'btn-page-active' : 'btn-page'} onClick={() => setPage(p)}>
                    {p}
                  </button>
                );
              })}
              <button className="btn-pagination" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button>
              <button className="btn-pagination" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={16} /></button>
            </div>
          </div>
        </div>
      ) : (
        /* CHECK 5: Cards View */
        <div className="grid grid-cols-3 gap-6">
          {logs.map(log => (
            <div key={log.id} className="card p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getActionIcon(log.action)}
                  <span style={{ fontWeight: 600 }}>{log.action}</span>
                </div>
                {getModuleBadge(log.module)}
              </div>
              <p style={{ fontSize: '13px', color: '#1a1a1a', marginBottom: '16px', minHeight: '40px' }}>{log.detail}</p>
              <div className="flex justify-between items-end border-t pt-3">
                <div className="flex items-center gap-2">
                  <div className="avatar-circle" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                    {log.username?.substring(0, 2).toUpperCase() || 'SA'}
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{log.username || 'SuperAdmin'}</span>
                    <span style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace' }}>{log.ip_address}</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#888' }}>
                  {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
