import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import db from './db.js';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
      res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- BOOKING ROUTES ---
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
    res.status(201).json({ id: Number(result.lastInsertRowid) });
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- INCOME ROUTES ---
app.get('/api/income', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM income ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/income', authenticateToken, async (req, res) => {
  const { category, amount, description, date } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO income (category, amount, description, date) VALUES (?, ?, ?, ?)',
      args: [category, amount, description, date]
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EXPENSE ROUTES ---
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { category, amount, description, date } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO expenses (category, amount, description, date) VALUES (?, ?, ?, ?)',
      args: [category, amount, description, date]
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DASHBOARD STATS ---
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const bookingsCount = await db.execute('SELECT COUNT(*) as count FROM bookings');
    const incomeSum = await db.execute('SELECT SUM(amount) as total FROM income');
    const expenseSum = await db.execute('SELECT SUM(amount) as total FROM expenses');
    const pendingBookings = await db.execute("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");

    res.json({
      totalBookings: bookingsCount.rows[0].count,
      totalIncome: incomeSum.rows[0].total || 0,
      totalExpenses: expenseSum.rows[0].total || 0,
      pendingBookings: pendingBookings.rows[0].count,
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
