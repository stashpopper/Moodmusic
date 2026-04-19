const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Add diagnostic logging
console.log('=== MoodMusic Backend Starting ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

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

module.exports = app;
