import React from 'react';
import { FileText, Download } from 'lucide-react';

const Reports = () => {
  return (
    <div>
      <h1 className="mb-4">Reports</h1>
      <div className="grid">
        <div className="card glass">
          <div className="flex justify-between items-center mb-4">
            <h2 className="flex items-center gap-2"><FileText size={20} /> Booking Report</h2>
            <button className="btn-outline"><Download size={16} /> Export</button>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Generate a comprehensive report of all bookings in a date range.</p>
        </div>
        <div className="card glass">
          <div className="flex justify-between items-center mb-4">
            <h2 className="flex items-center gap-2"><FileText size={20} /> Financial Summary</h2>
            <button className="btn-outline"><Download size={16} /> Export</button>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Analyze income vs expenses and track profitability.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
