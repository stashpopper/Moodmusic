const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5000', 'https://clever-marigold-6e1a21.netlify.app'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors()); // Allow all preflight OPTIONS requests
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

// Schema and Models
const songHistorySchema = new mongoose.Schema({
  songTitle: String,
  artist: String,
  youtubeLink: String,
  mood: String,
  language: String,
  genre: String,
  timestamp: { type: Date, default: Date.now },
  feedback: { type: String, enum: ['like', 'dislike', null], default: null }
});
const SongHistory = mongoose.model('SongHistory', songHistorySchema);

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

// Route to save song to history
app.post('/api/history', async (req, res) => {
  try {
    const { songTitle, artist, youtubeLink, mood, language, genre } = req.body;
    const history = new SongHistory({
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

// Route to get song history
app.get('/api/history', async (req, res) => {
  try {
    const history = await SongHistory.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// Route to update song feedback
app.put('/api/history/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
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

// Route to delete a song from history
app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSong = await SongHistory.findByIdAndDelete(id);
    if (!deletedSong) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }
    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ success: false, error: 'Failed to delete song' });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
