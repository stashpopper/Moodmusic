const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Add diagnostic logging
console.log('=== MoodMusic Backend Starting ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'NOT CONFIGURED');
console.log('MISTRAL_API_KEY:', process.env.MISTRAL_API_KEY ? 'configured' : 'NOT CONFIGURED');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://moodandmusic.netlify.app', 'http://localhost:5173', 'http://localhost:3000', 'https://moodmusic-topaz.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');
const lyricsRoutes = require('./src/routes/lyricsRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected/history', historyRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', lyricsRoutes);

// Add diagnostic log for route setup
console.log('Routes configured:');
console.log('  - /api/auth');
console.log('  - /api/protected/history');
console.log('  - /api/recommendations');
console.log('  - /api/community');
console.log('  - /api/lyrics');

// Start server - REMOVE the conditional NODE_ENV check
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=== MoodMusic Backend Started Successfully ===');
});

// Handle 404 errors - return JSON instead of HTML
app.use((req, res, next) => {
  next(new Error(`Not Found: ${req.originalUrl} ${req.method}`));
});

// Handle 500 errors - return JSON instead of HTML
app.use((err, req, res, next) => {
  console.error('500 Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

module.exports = app;
