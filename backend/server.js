const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://moodandmusic.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected/history', historyRoutes);
app.use('/api', recommendationRoutes);

// General Community Route (if not in recommendationRoutes)
const { communitySongs } = require('./src/controllers/recommendationsController');
app.get('/api/community', communitySongs);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
