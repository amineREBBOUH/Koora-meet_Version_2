require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Disable Mongoose Buffering (Prevents the 10s timeout error)
mongoose.set('bufferCommands', false);

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Logger for Vercel
app.use((req, res, next) => {
  console.log(`📡 Request received: ${req.method} ${req.url}`);
  next();
});

app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/groups', require('./routes/groups'));

// Health Check Route
app.get('/api/health', (req, res) => {
  const status = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  res.json({
    status: states[status],
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    environment: process.env.NODE_ENV
  });
});

// Root Route
app.get('/', (req, res) => {
    res.json({ message: "Koora Meet API is running" });
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log('⚠️ Warning: MONGODB_URI not found. Running in temporary mock mode.');
} else {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
      console.log('❌ DB Connection failed, but server is still running for safety.');
      console.log('Error:', err.message);
    });
}

// Start Server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
