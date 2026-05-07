import React, { useState } from 'react';
import api from '../api';
import { 
  BarChart3, 
  Download, 
  FileText, 
  RefreshCw, 
  Zap, 
  Check, 
  TrendingUp, 
  TrendingDown,
  Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReportTypeButton = ({ label, selected, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-lg border-2 transition-all font-medium ${
      selected 
        ? 'border-[#C4920B] bg-[#FEF9EE] text-[#1a1a1a]' 
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
    }`}
    style={{ fontSize: '14px' }}
  >
    {label} {selected && <Check size={16} className="text-[#C4920B]" />}
  </button>
);

const Reports = () => {
  const [selectedTypes, setSelectedTypes] = useState(['Booking Report']);
  const [period, setPeriod] = useState('Monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [paymentMode, setPaymentMode] = useState('All Modes');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    'Booking Report',
    'Other Source of Income Report',
    'Expense Report',
    'Profit & Loss',
    'Revenue Summary',
    'Combined Financial'
  ];

  const handleToggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one report type');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/reports/generate', {
        types: selectedTypes,
        period,
        from: dateFrom,
        to: dateTo,
        status,
        paymentMode
      });
      setReportData(res.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedTypes(['Booking Report']);
    setPeriod('Monthly');
    setDateFrom('');
    setDateTo('');
    setStatus('All Statuses');
    setPaymentMode('All Modes');
    setReportData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const calculatePL = () => {
    if (!reportData) return { income: 0, expenses: 0, profit: 0 };
    const bookingIncome = (reportData.bookings || []).reduce((sum, b) => sum + (b.agreed_total || 0), 0);
    const otherIncome = (reportData.income || []).reduce((sum, i) => sum + (i.amount || 0), 0);
    const expenses = (reportData.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncome = bookingIncome + otherIncome;
    return {
      income: totalIncome,
      expenses,
      profit: totalIncome - expenses
    };
  };

  const pl = calculatePL();

  return (
    <div className="reports-page">
      {/* CHECK 1: Page Header */}
      <div className="mb-8 print:hidden">
        <div className="flex items-center gap-3">
          <BarChart3 size={26} color="#C4920B" />
          <h1 style={{ margin: 0 }}>Reports</h1>
        </div>
        <p className="subtitle">Generate financial and operational reports</p>
      </div>

      {/* CHECK 2: Report Configuration Card */}
      <div className="card mb-8 p-7 print:hidden">
        <span className="label-caps mb-6 block">REPORT CONFIGURATION</span>
        
        {/* CHECK 3: Report Type Toggle Buttons */}
        <div className="mb-8">
          <span className="label-caps mb-3 block" style={{ fontSize: '11px' }}>REPORT TYPE — SELECT ONE OR MORE</span>
          <div className="flex flex-wrap gap-3">
            {reportTypes.map(type => (
              <ReportTypeButton 
                key={type} 
                label={type} 
                selected={selectedTypes.includes(type)} 
                onClick={() => handleToggleType(type)} 
              />
            ))}
          </div>
        </div>

        {/* CHECK 4: Filter Dropdowns */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="form-group">
            <label>PERIOD</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div className="form-group">
            <label>BOOKING STATUS FILTER</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All Statuses</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>PAYMENT MODE</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option>All Modes</option>
              <option>UPI</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </select>
          </div>
        </div>

        {period === 'Custom Range' && (
          <div className="grid grid-cols-2 gap-6 mb-6 animate-fade-in">
            <div className="form-group">
              <label>DATE FROM</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label>DATE TO</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        )}

        {/* CHECK 5: Action Buttons */}
        <div className="flex gap-4 border-t pt-6">
          <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />} Generate Report
          </button>
          <button className="btn-danger" onClick={handleReset}>
             Reset
          </button>
        </div>
      </div>

      {/* CHECK 6: Generated Report Output */}
      {reportData && (
        <div className="report-output space-y-8 animate-slide-up print:m-0 print:p-0">
          <div className="card p-6 print:border-none print:shadow-none">
            <div className="flex justify-between items-center mb-6 print:block">
              <div className="print:text-center">
                <h2 className="print:text-2xl print:mb-2">16 Eyes Farm House</h2>
                <div className="flex items-center gap-2 text-gray-500 print:justify-center">
                  <FileText size={16} />
                  <span>{selectedTypes.join(', ')}</span>
                  <span className="mx-2">•</span>
                  <span>{period} ({dateFrom || 'Start'} to {dateTo || 'End'})</span>
                </div>
              </div>
              <div className="flex gap-3 print:hidden">
                <button className="btn-inactive-toggle" onClick={handlePrint}>
                  <Printer size={16} /> Print / PDF
                </button>
                <button className="btn-inactive-toggle">
                  <Download size={16} /> Excel
                </button>
              </div>
            </div>

            {/* Profit & Loss Section */}
            {(selectedTypes.includes('Profit & Loss') || selectedTypes.includes('Combined Financial')) && (
              <div className="mb-10">
                <h3 className="section-title mb-4" style={{ fontSize: '18px', color: '#1a1a1a' }}>Profit & Loss Statement</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="card p-4 bg-green-50 border-green-100">
                    <span className="label-caps text-green-700">Total Income</span>
                    <div className="text-2xl font-bold text-green-700">₹{pl.income.toLocaleString()}</div>
                  </div>
                  <div className="card p-4 bg-red-50 border-red-100">
                    <span className="label-caps text-red-700">Total Expenses</span>
                    <div className="text-2xl font-bold text-red-700">₹{pl.expenses.toLocaleString()}</div>
                  </div>
                  <div className="card p-4" style={{ backgroundColor: pl.profit >= 0 ? '#F0FDF4' : '#FEF2F2' }}>
                    <span className="label-caps" style={{ color: pl.profit >= 0 ? '#166534' : '#991B1B' }}>Net Profit/Loss</span>
                    <div className="text-2xl font-bold" style={{ color: pl.profit >= 0 ? '#166534' : '#991B1B' }}>
                      {pl.profit >= 0 ? <TrendingUp className="inline mr-2" /> : <TrendingDown className="inline mr-2" />}
                      ₹{Math.abs(pl.profit).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Summary Table */}
            {(selectedTypes.includes('Revenue Summary') || selectedTypes.includes('Combined Financial')) && (
              <div className="mb-10">
                <h3 className="section-title mb-4">Revenue Summary (by Month)</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr className="bg-[#F8F7F2]">
                        <th>MONTH</th>
                        <th>BOOKING REVENUE</th>
                        <th>OTHER INCOME</th>
                        <th>TOTAL REVENUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries((reportData.bookings || []).concat(reportData.income || []).reduce((acc, curr) => {
                        const month = new Date(curr.date).toLocaleString('default', { month: 'long', year: 'numeric' });
                        if (!acc[month]) acc[month] = { booking: 0, other: 0 };
                        if (curr.agreed_total !== undefined) acc[month].booking += curr.agreed_total;
                        else acc[month].other += (curr.amount || 0);
                        return acc;
                      }, {})).map(([month, values]) => (
                        <tr key={month}>
                          <td>{month}</td>
                          <td>₹{values.booking.toLocaleString()}</td>
                          <td>₹{values.other.toLocaleString()}</td>
                          <td className="text-green-600 font-bold">₹{(values.booking + values.other).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Booking Report Table */}
            {(selectedTypes.includes('Booking Report') || selectedTypes.includes('Combined Financial')) && (
              <div className="mb-10">
                <h3 className="section-title mb-4">Booking Report</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr className="bg-[#F8F7F2]">
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>DATE</th>
                        <th>SLOT</th>
                        <th>AGREED</th>
                        <th>ADVANCE</th>
                        <th>BALANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.bookings?.map(b => (
                        <tr key={b.id}>
                          <td className="text-[#C4920B] font-semibold">{`16EYE${String(b.id).padStart(2, '0')}`}</td>
                          <td>{b.customer_name}</td>
                          <td>{new Date(b.date).toLocaleDateString('en-GB')}</td>
                          <td>{b.slot_id}</td>
                          <td className="text-green-600 font-medium">₹{b.agreed_total.toLocaleString()}</td>
                          <td>₹{b.advance_paid.toLocaleString()}</td>
                          <td className={b.remaining_balance > 0 ? 'text-red-500' : 'text-green-600'}>
                            ₹{b.remaining_balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Other Source of Income Report */}
            {(selectedTypes.includes('Other Source of Income Report') || selectedTypes.includes('Combined Financial')) && (
              <div className="mb-10">
                <h3 className="section-title mb-4">Other Income Report</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr className="bg-[#F8F7F2]">
                        <th>DATE</th>
                        <th>TYPE</th>
                        <th>AMOUNT</th>
                        <th>PAYMENT</th>
                        <th>REFERENCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.income?.map(i => (
                        <tr key={i.id}>
                          <td>{new Date(i.date).toLocaleDateString('en-GB')}</td>
                          <td>{i.type}</td>
                          <td className="text-green-600 font-medium">₹{i.amount.toLocaleString()}</td>
                          <td>{i.payment_mode}</td>
                          <td>{i.reference || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Expense Report Table */}
            {(selectedTypes.includes('Expense Report') || selectedTypes.includes('Combined Financial')) && (
              <div className="mb-10">
                <h3 className="section-title mb-4">Expense Report</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr className="bg-[#F8F7F2]">
                        <th>DATE</th>
                        <th>TYPE</th>
                        <th>AMOUNT</th>
                        <th>PAYMENT</th>
                        <th>VENDOR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.expenses?.map(e => (
                        <tr key={e.id}>
                          <td>{new Date(e.date).toLocaleDateString('en-GB')}</td>
                          <td>{e.type}</td>
                          <td className="text-red-600 font-medium">₹{e.amount.toLocaleString()}</td>
                          <td>{e.payment_mode}</td>
                          <td>{e.vendor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
