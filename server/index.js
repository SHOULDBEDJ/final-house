import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import db from './db.js';
import PDFDocument from 'pdfkit';

dotenv.config();

// Master Slot Definitions
const SLOTS = [
  { id: 1, name: 'Morng Slot', start: '11:00', end: '19:00', crossesMidnight: false, color: '#198754' },
  { id: 2, name: 'Eve to Eve slot', start: '20:00', end: '19:00', crossesMidnight: true, color: '#C4920B' },
  { id: 3, name: 'Photoshoot Slot', start: '14:00', end: '18:00', crossesMidnight: false, color: '#1C2D5E' },
  { id: 4, name: 'Eve Slot', start: '20:00', end: '10:00', crossesMidnight: true, color: '#3B82F6' },
  { id: 5, name: 'Full day', start: '11:00', end: '10:00', crossesMidnight: true, color: '#DC3545' }
];

// Helper to convert Date + Time string to Date object
const getSlotDateTime = (dateStr, timeStr, offsetDays = 0) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offsetDays);
  const [h, m] = timeStr.split(':');
  d.setHours(parseInt(h), parseInt(m), 0, 0);
  return d;
};

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function logActivity(userId, action, module, detail, ip) {
  try {
    await db.execute({
      sql: 'INSERT INTO activity_logs (user_id, action, module, detail, ip_address) VALUES (?, ?, ?, ?, ?)',
      args: [userId, action, module, detail, ip]
    });
  } catch (error) {
    console.error('Logging error:', error);
  }
}

app.use(cors());
app.use(express.json());

// Root Health Check
app.get('/', (req, res) => {
  res.json({ status: 'success', message: '16 Eyes Farm House API is running' });
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    const user = result.rows[0];

    if (user && user.password === password) { // In production, use bcrypt
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
      await logActivity(user.id, 'Login', 'Auth', `User ${username} logged in`, req.ip);
      res.json({ token, user: { id: user.id, username: username, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- BOOKING ROUTES ---
app.get('/api/bookings/summary', authenticateToken, async (req, res) => {
  try {
    const data = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM bookings'),
      db.execute("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'"),
      db.execute("SELECT SUM(total_amount - advance_paid - discount) as balance FROM bookings WHERE status = 'pending'"),
      db.execute('SELECT SUM(advance_paid) as advance FROM bookings'),
      db.execute('SELECT SUM(amount) as income FROM income'),
      db.execute('SELECT (IFNULL(SUM(amount), 0) - (SELECT IFNULL(SUM(amount), 0) FROM expenses)) as cash FROM income')
    ]);

    res.json({
      total: data[0].rows[0].count || 0,
      confirmed: data[1].rows[0].count || 0,
      pendingBalance: data[2].rows[0].balance || 0,
      advanceCollected: data[3].rows[0].advance || 0,
      totalIncome: data[4].rows[0].income || 0,
      cashInHand: data[5].rows[0].cash || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/bookings/:id/confirm', authenticateToken, async (req, res) => {
  try {
    await db.execute({
      sql: "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
      args: [req.params.id]
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM bookings ORDER BY check_in DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { customer_name, customer_phone, check_in, check_out, total_amount, advance_paid, notes } = req.body;
  try {
    const result = await db.execute({
      sql: 'INSERT INTO bookings (customer_name, customer_phone, check_in, check_out, total_amount, advance_paid, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [customer_name, customer_phone, check_in, check_out, total_amount, advance_paid, notes]
    });
    const bookingId = Number(result.lastInsertRowid);
    await logActivity(req.user.id, 'Create', 'Bookings', `Created booking 16EYE${bookingId} for ${customer_name}`, req.ip);
    res.status(201).json({ id: bookingId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { customer_name, customer_phone, check_in, check_out, total_amount, advance_paid, status, notes } = req.body;
  try {
    await db.execute({
      sql: 'UPDATE bookings SET customer_name = ?, customer_phone = ?, check_in = ?, check_out = ?, total_amount = ?, advance_paid = ?, status = ?, notes = ? WHERE id = ?',
      args: [customer_name, customer_phone, check_in, check_out, total_amount, advance_paid, status, notes, id]
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute({ sql: 'DELETE FROM bookings WHERE id = ?', args: [id] });
    await logActivity(req.user.id, 'Delete', 'Bookings', `Deleted booking 16EYE${id}`, req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- INCOME ROUTES ---
app.get('/api/income/summary', authenticateToken, async (req, res) => {
  try {
    const data = await Promise.all([
      db.execute('SELECT SUM(amount) as total FROM income'),
      db.execute('SELECT COUNT(*) as count FROM income')
    ]);
    res.json({
      total: data[0].rows[0].total || 0,
      count: data[1].rows[0].count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings/income-types', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute('SELECT name FROM income_types');
    res.json(result.rows.map(r => r.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/income', authenticateToken, async (req, res) => {
  const { type, from, to, search } = req.query;
  let sql = 'SELECT * FROM income WHERE 1=1';
  const args = [];

  if (type && type !== 'All Types') {
    sql += ' AND type = ?';
    args.push(type);
  }
  if (from) {
    sql += ' AND date >= ?';
    args.push(from);
  }
  if (to) {
    sql += ' AND date <= ?';
    args.push(to);
  }
  if (search) {
    sql += ' AND (description LIKE ? OR reference LIKE ?)';
    args.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY date DESC';

  try {
    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/income', authenticateToken, async (req, res) => {
  const { amount, description, date, type, payment_mode, reference } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO income (amount, description, date, type, payment_mode, reference) VALUES (?, ?, ?, ?, ?, ?)',
      args: [amount, description, date, type, payment_mode, reference]
    });
    await logActivity(req.user.id, 'Create', 'Income', `Added income: ₹${amount} (${type})`, req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/income/:id', authenticateToken, async (req, res) => {
  const { amount, description, date, type, payment_mode, reference } = req.body;
  try {
    await db.execute({
      sql: 'UPDATE income SET amount = ?, description = ?, date = ?, type = ?, payment_mode = ?, reference = ? WHERE id = ?',
      args: [amount, description, date, type, payment_mode, reference, req.params.id]
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/income/:id', authenticateToken, async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM income WHERE id = ?', args: [req.params.id] });
    await logActivity(req.user.id, 'Delete', 'Income', `Deleted income record ID: ${req.params.id}`, req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/expenses/summary', authenticateToken, async (req, res) => {
  try {
    const data = await Promise.all([
      db.execute('SELECT SUM(amount) as total FROM expenses'),
      db.execute('SELECT COUNT(*) as count FROM expenses')
    ]);
    res.json({
      total: data[0].rows[0].total || 0,
      count: data[1].rows[0].count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings/expense-types', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute('SELECT name FROM expense_types');
    res.json(result.rows.map(r => r.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
  const { type, from, to, search } = req.query;
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const args = [];

  if (type && type !== 'All Types') {
    sql += ' AND type = ?';
    args.push(type);
  }
  if (from) {
    sql += ' AND date >= ?';
    args.push(from);
  }
  if (to) {
    sql += ' AND date <= ?';
    args.push(to);
  }
  if (search) {
    sql += ' AND (description LIKE ? OR vendor LIKE ?)';
    args.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY date DESC';

  try {
    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { amount, description, date, type, payment_mode, vendor, reference } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO expenses (amount, description, date, type, payment_mode, vendor, reference) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [amount, description, date, type, payment_mode, vendor, reference]
    });
    await logActivity(req.user.id, 'Create', 'Expenses', `Added expense: ₹${amount} to ${vendor}`, req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  const { amount, description, date, type, payment_mode, vendor, reference } = req.body;
  try {
    await db.execute({
      sql: 'UPDATE expenses SET amount = ?, description = ?, date = ?, type = ?, payment_mode = ?, vendor = ?, reference = ? WHERE id = ?',
      args: [amount, description, date, type, payment_mode, vendor, reference, req.params.id]
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM expenses WHERE id = ?', args: [req.params.id] });
    await logActivity(req.user.id, 'Delete', 'Expenses', `Deleted expense record ID: ${req.params.id}`, req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AVAILABILITY ROUTES ---
app.get('/api/bookings/availability', authenticateToken, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const d = new Date(date);
    const yesterday = new Date(d); yesterday.setDate(d.getDate() - 1);
    const tomorrow = new Date(d); tomorrow.setDate(d.getDate() + 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings = await db.execute({
      sql: "SELECT * FROM bookings WHERE status = 'confirmed' AND (date = ? OR date = ? OR date = ?)",
      args: [yesterdayStr, date, tomorrowStr]
    });

    const availability = SLOTS.map(slot => {
      const reqStart = getSlotDateTime(date, slot.start);
      const reqEnd = getSlotDateTime(date, slot.end, slot.crossesMidnight ? 1 : 0);
      let conflict = false;
      let reason = '';

      for (const b of bookings.rows) {
        const bSlot = SLOTS.find(s => s.id === b.slot_id) || SLOTS[0];
        const bStart = getSlotDateTime(b.date, bSlot.start);
        const bEnd = getSlotDateTime(b.date, bSlot.end, bSlot.crossesMidnight ? 1 : 0);

        if (reqStart < bEnd && bStart < reqEnd) {
          conflict = true;
          reason = `Conflict with ${b.customer_name} (${bSlot.name})`;
          break;
        }
      }
      return { slotId: slot.id, slotName: slot.name, color: slot.color, available: !conflict, reason };
    });
    res.json({ slots: availability });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DASHBOARD STATS ---
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get week start (Sunday)
    const curr = new Date();
    const first = curr.getDate() - curr.getDay();
    const weekStart = new Date(curr.setDate(first)).toISOString().split('T')[0];
    
    // Get month start
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const stats = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM bookings'),
      db.execute({ sql: 'SELECT COUNT(*) as count FROM bookings WHERE date = ?', args: [today] }),
      db.execute({ sql: 'SELECT COUNT(*) as count FROM bookings WHERE date >= ?', args: [monthStart] }),
      db.execute({ sql: 'SELECT COUNT(*) as count FROM bookings WHERE date >= ?', args: [weekStart] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed' AND date > ?", args: [today] }),
      db.execute('SELECT SUM(amount) as total FROM income'),
      db.execute('SELECT SUM(amount) as total FROM expenses')
    ]);

    res.json({
      totalBookings: stats[0].rows[0].count,
      todayBookings: stats[1].rows[0].count,
      monthlyBookings: stats[2].rows[0].count,
      weeklyBookings: stats[3].rows[0].count,
      upcomingBookings: stats[4].rows[0].count,
      totalIncome: stats[5].rows[0].total || 0,
      totalExpenses: stats[6].rows[0].total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PDF GENERATION ---
app.get('/api/bookings/:id/pdf', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute({ sql: 'SELECT * FROM bookings WHERE id = ?', args: [id] });
    const booking = result.rows[0];

    if (!booking) return res.status(404).send('Booking not found');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${id}.pdf`);

    doc.pipe(res);

    doc.fontSize(25).text('16 Eyes Farm House', { align: 'center' });
    doc.fontSize(15).text('Booking Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Booking ID: ${booking.id}`);
    doc.text(`Customer: ${booking.customer_name}`);
    doc.text(`Phone: ${booking.customer_phone}`);
    doc.text(`Check-in: ${new Date(booking.check_in).toLocaleDateString()}`);
    doc.text(`Check-out: ${new Date(booking.check_out).toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Total Amount: ₹${booking.total_amount}`);
    doc.text(`Advance Paid: ₹${booking.advance_paid}`);
    doc.text(`Balance Due: ₹${booking.total_amount - booking.advance_paid}`);
    doc.moveDown();

    doc.text(`Status: ${booking.status.toUpperCase()}`);
    doc.moveDown();
    doc.text('Thank you for choosing 16 Eyes Farm House!', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SETTINGS ---
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  const settings = req.body;
  try {
    for (const [key, value] of Object.entries(settings)) {
      await db.execute({
        sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        args: [key, value]
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- REPORT ROUTES ---
app.post('/api/reports/generate', authenticateToken, async (req, res) => {
  const { types, period, from, to, status, paymentMode } = req.body;
  
  let dateFrom = from;
  let dateTo = to;

  if (period !== 'Custom Range') {
    const now = new Date();
    if (period === 'Daily') {
      dateFrom = now.toISOString().split('T')[0];
      dateTo = dateFrom;
    } else if (period === 'Weekly') {
      const first = now.getDate() - now.getDay();
      dateFrom = new Date(now.setDate(first)).toISOString().split('T')[0];
      dateTo = new Date().toISOString().split('T')[0];
    } else if (period === 'Monthly') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (period === 'Yearly') {
      dateFrom = `${now.getFullYear()}-01-01`;
      dateTo = `${now.getFullYear()}-12-31`;
    }
  }

  const reports = {};

  try {
    if (types.includes('Booking Report') || types.includes('Profit & Loss') || types.includes('Combined Financial') || types.includes('Revenue Summary')) {
      let sql = 'SELECT * FROM bookings WHERE 1=1';
      const args = [];
      if (dateFrom) { sql += ' AND date >= ?'; args.push(dateFrom); }
      if (dateTo) { sql += ' AND date <= ?'; args.push(dateTo); }
      if (status && status !== 'All Statuses') { sql += ' AND status = ?'; args.push(status); }
      
      const result = await db.execute({ sql, args });
      reports.bookings = result.rows;
    }

    if (types.includes('Other Source of Income Report') || types.includes('Profit & Loss') || types.includes('Combined Financial') || types.includes('Revenue Summary')) {
      let sql = 'SELECT * FROM income WHERE 1=1';
      const args = [];
      if (dateFrom) { sql += ' AND date >= ?'; args.push(dateFrom); }
      if (dateTo) { sql += ' AND date <= ?'; args.push(dateTo); }
      if (paymentMode && paymentMode !== 'All Modes') { sql += ' AND payment_mode = ?'; args.push(paymentMode); }
      
      const result = await db.execute({ sql, args });
      reports.income = result.rows;
    }

    if (types.includes('Expense Report') || types.includes('Profit & Loss') || types.includes('Combined Financial')) {
      let sql = 'SELECT * FROM expenses WHERE 1=1';
      const args = [];
      if (dateFrom) { sql += ' AND date >= ?'; args.push(dateFrom); }
      if (dateTo) { sql += ' AND date <= ?'; args.push(dateTo); }
      if (paymentMode && paymentMode !== 'All Modes') { sql += ' AND payment_mode = ?'; args.push(paymentMode); }
      
      const result = await db.execute({ sql, args });
      reports.expenses = result.rows;
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROFILE ROUTES ---
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id, username, name, role, photo, created_at FROM users WHERE id = ?',
      args: [req.user.id]
    });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { name, username } = req.body;
  try {
    await db.execute({
      sql: 'UPDATE users SET name = ?, username = ? WHERE id = ?',
      args: [name, username, req.user.id]
    });
    await logActivity(req.user.id, 'Edit', 'Users', 'Updated profile details', req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await db.execute({
      sql: 'SELECT password FROM users WHERE id = ?',
      args: [req.user.id]
    });
    const user = result.rows[0];

    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await db.execute({
      sql: 'UPDATE users SET password = ? WHERE id = ?',
      args: [newPassword, req.user.id]
    });
    await logActivity(req.user.id, 'Edit', 'Auth', 'Changed account password', req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile/photo', authenticateToken, async (req, res) => {
  const { photo } = req.body; // Expecting base64 or URL
  try {
    await db.execute({
      sql: 'UPDATE users SET photo = ? WHERE id = ?',
      args: [photo, req.user.id]
    });
    await logActivity(req.user.id, 'Edit', 'Users', 'Updated profile photo', req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile/sessions', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT timestamp, ip_address, detail FROM activity_logs WHERE user_id = ? AND action = 'Login' ORDER BY timestamp DESC LIMIT 3",
      args: [req.user.id]
    });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/activity-logs', authenticateToken, async (req, res) => {
  const { module, action, from, to, search, page = 1 } = req.query;
  const limit = 50;
  const offset = (page - 1) * limit;

  let sql = 'SELECT al.*, u.username FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1';
  let countSql = 'SELECT COUNT(*) as count FROM activity_logs WHERE 1=1';
  const args = [];

  if (module && module !== 'All Modules') {
    sql += ' AND module = ?';
    countSql += ' AND module = ?';
    args.push(module);
  }
  if (action && action !== 'All Actions') {
    sql += ' AND action = ?';
    countSql += ' AND action = ?';
    args.push(action);
  }
  if (from) {
    sql += ' AND timestamp >= ?';
    countSql += ' AND timestamp >= ?';
    args.push(from);
  }
  if (to) {
    sql += ' AND timestamp <= ?';
    countSql += ' AND timestamp <= ?';
    args.push(to);
  }
  if (search) {
    sql += ' AND (detail LIKE ? OR u.username LIKE ?)';
    countSql += ' AND (detail LIKE ? OR (SELECT username FROM users WHERE id = user_id) LIKE ?)';
    args.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  const queryArgs = [...args, limit, offset];

  try {
    const [logs, total] = await Promise.all([
      db.execute({ sql, args: queryArgs }),
      db.execute({ sql: countSql, args })
    ]);
    res.json({
      logs: logs.rows,
      total: total.rows[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
