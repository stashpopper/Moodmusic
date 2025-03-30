const express = require('express');
const mongoose = require('mongoose');
// We'll conditionally use CORS for local development
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); 

const app = express();

// Use CORS middleware only in development environment
// In production, NGINX will handle CORS
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  console.log('Running in development mode - using CORS middleware');
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://themoodmusic.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }));
} else {
  console.log('Running in production mode - CORS handled by NGINX');
}

app.use(express.json()); // Middleware to parse JSON

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Atlas Connected');
  } catch (err) {
    console.error('MongoDB Connection failed:', err.message);
    process.exit(1);
  }
};
connectDB();

// Profile Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Profile = mongoose.model('Profile', userSchema);

// Song History Schema and Model
const songHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  songTitle: String,
  artist: String,
  youtubeLink: String,
  mood: String,
  language: String,
  genre: String,
  timestamp: { type: Date, default: Date.now },
  feedback: { type: String, enum: ['liked', 'disliked', null], default: null }
});
const SongHistory = mongoose.model('SongHistory', songHistorySchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    // For routes that need authentication
    if (req.originalUrl.includes('/api/protected')) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }
    // For routes where authentication is optional
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid token.' });
  }
};

// Apply the middleware to all routes (will differentiate with req.user)
app.use(verifyToken);

// AUTH ROUTES
// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingProfile = await Profile.findOne({ $or: [{ email }, { username }] });
    if (existingProfile) {
      return res.status(400).json({ 
        success: false, 
        error: existingProfile.email === email ? 'Email already exists' : 'Profilename already exists' 
      });
    }
    
    // Create new user
    const user = new Profile({ username, email, password });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// Get current user info
app.get('/api/auth/user', async (req, res) => {
  if (!req.user) {
    return res.json({ success: false, isAuthenticated: false });
  }
  
  try {
    const user = await Profile.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    
    res.json({ 
      success: true, 
      isAuthenticated: true,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user information' });
  }
});

// SONG RECOMMENDATION ROUTES
// Route to get song recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const { mood, language, genre } = req.body;

    const prompt = `You are a music expert. Suggest 5 diverse ${language} ${genre} songs that match a ${mood} mood. Format: "Song Title - Artist Name"`;
    const mistralResponse = await axios.post('https://api.mistral.ai/v1/chat/completions', {
      messages: [{ role: "user", content: prompt }],
      model: "mistral-large-2411",
      temperature: 0.7
    }, {
      headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`, 'Content-Type': 'application/json' }
    });

    const songs = mistralResponse.data.choices[0].message.content
      .split('\n')
      .filter(line => line.includes('-'))
      .map(line => line.trim().replace(/^"|"$/g, ''));

    // **Dynamically import `youtube-search-without-api-key`**
    const { search } = await import('youtube-search-without-api-key');

    const songsWithLinks = await Promise.all(songs.map(async (songInfo) => {
      try {
        const videos = await search(songInfo);
        const youtubeLink = videos.length > 0 ? `https://www.youtube.com/watch?v=${videos[0].id.videoId}` : '#';
        return { title: songInfo, link: youtubeLink };
      } catch (error) {
        console.error(`Error fetching YouTube link for ${songInfo}:`, error);
        return { title: songInfo, link: '#' };
      }
    }));

    res.json({ success: true, recommendations: songsWithLinks.filter(song => song.link !== '#') });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
});

// HISTORY ROUTES
// Route to save song to history (only for authenticated users)
app.post('/api/protected/history', async (req, res) => {
  try {
    const { songTitle, artist, youtubeLink, mood, language, genre } = req.body;
    
    const history = new SongHistory({
      userId: req.user.id,
      songTitle,
      artist,
      youtubeLink,
      mood,
      language,
      genre
    });
    
    await history.save();
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error saving to history:', error);
    res.status(500).json({ success: false, error: 'Failed to save to history' });
  }
});

// Route to get personal song history (for authenticated users)
app.get('/api/protected/history', async (req, res) => {
  try {
    const history = await SongHistory.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// Route to get community songs (all songs from all users, with optional filtering)
app.get('/api/community', async (req, res) => {
  try {
    const { mood, language, genre } = req.query;
    
    // Build filter based on query params
    const filter = {};
    if (mood) filter.mood = mood;
    if (language) filter.language = language;
    if (genre) filter.genre = genre;
    
    const songs = await SongHistory.find(filter)
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ success: true, songs });
  } catch (error) {
    console.error('Error fetching community songs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch community songs' });
  }
});

// Route to update song feedback (only for authenticated users)
app.put('/api/protected/history/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    
    // Make sure the song belongs to the authenticated user
    const song = await SongHistory.findById(id);
    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }
    
    if (song.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const updated = await SongHistory.findByIdAndUpdate(
      id,
      { feedback },
      { new: true }
    );
    
    res.json({ success: true, updated });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to update feedback' });
  }
});

// Route to delete a song from history (only for authenticated users)
app.delete('/api/protected/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Make sure the song belongs to the authenticated user
    const song = await SongHistory.findById(id);
    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }
    
    if (song.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    await SongHistory.findByIdAndDelete(id);
    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ success: false, error: 'Failed to delete song' });
  }
});

// BACKWARDS COMPATIBILITY - for the transition period
// Old route that will be deprecated
app.get('/api/history', async (req, res) => {
  try {
    let history = [];
    if (req.user) {
      // Authenticated user - get their history
      history = await SongHistory.find({ userId: req.user.id })
        .sort({ timestamp: -1 })
        .limit(100);
    } else {
      // Guest user - return empty history
      history = [];
    }
    
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
