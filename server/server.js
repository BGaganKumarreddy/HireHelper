require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const requestRoutes = require('./routes/requests');
const notificationRoutes = require('./routes/notifications');
const { initTable } = require('./models/taskModel');
const { initRequestTable } = require('./models/requestModel');
const { initNotificationTable } = require('./models/notificationModel');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes.router); // Note: updated to use .router property
app.use('/api/tasks', taskRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HireHelper API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

async function startServer() {
  try {
    console.log('⏳ Initializing database tables...');
    await initTable();
    await initRequestTable();
    await initNotificationTable();
    await authRoutes.initAuthSchema(); // Handle this explicitly

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

startServer();
