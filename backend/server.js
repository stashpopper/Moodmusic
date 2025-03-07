const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors({
  origin: ['http://localhost:5000', 'https://clever-marigold-6e1a21.netlify.app', 'https://moodmusic-production.up.railway.app'],
  credentials: true
}));
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

// Start the Server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
