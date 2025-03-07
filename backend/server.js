const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const searchYoutube = require('youtube-search-without-api-key');

const app = express();
app.use(cors({
  origin: ['http://localhost:5000', 'https://clever-marigold-6e1a21.netlify.app'],
  credentials: true
}));
app.use(express.json()); // Middleware to parse JSON

require('dotenv').config(); // Load environment variables

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });

    console.log('MongoDB Atlas Connected');

    // Set up connection error handling
    mongoose.connection.on('error', err => {
      console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error('MongoDB Connection failed:', err.message);
    process.exit(1);
  }
};

// Initialize MongoDB connection
connectDB();

// Schema and Models
const songHistorySchema = new mongoose.Schema({
  songTitle: { type: String, required: true },
  artist: { type: String, required: true },
  youtubeLink: { type: String, required: true },
  mood: { type: String, required: true },
  language: { type: String, required: true },
  genre: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  feedback: { type: String, enum: ['like', 'dislike', null], default: null }
});

const SongHistory = mongoose.model('SongHistory', songHistorySchema);

// Route to get song recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const { mood, language, genre } = req.body;

    // Construct prompt for Mistral API
    const prompt = `You are a music expert. Suggest 5 diverse ${language} ${genre} songs that perfectly match a ${mood} mood. Include both popular and lesser-known songs. For each song, provide both the song title and artist name, and also suggest a relevant YouTube link. Format your response exactly like this example, with one song per line:
"Shape of You - Ed Sheeran | Valid Youtube URL"`;

    // Updated prompt for Mistral API to just give song titles and artists
    const mistralResponse = await axios.post('https://api.mistral.ai/v1/chat/completions', {
      messages: [
        {
          role: "user",
          content: `You are a music expert. Suggest 5 diverse ${language} ${genre} songs that perfectly match a ${mood} mood. Include both popular and lesser-known songs. For each suggestion, provide only the song title and artist name in this exact format, one per line:
"Song Title - Artist Name"

Example:
"Shape of You - Ed Sheeran"
"Bohemian Rhapsody - Queen"`
        }
      ],
      model: "mistral-large-2411",
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Parse Mistral's response and get songs list
    const songs = mistralResponse.data.choices[0].message.content
      .split('\n')
      .filter(line => line.trim() && line.includes('-'))
      .map(line => line.trim().replace(/^"|"$/g, ''));

    // Get YouTube URLs and Last.fm images for each song
    const songsWithLinksAndImages = await Promise.all(songs.map(async (songInfo) => {
      try {
        // Get YouTube URL
        const videos = await searchYoutube.search(songInfo);
        const youtubeLink = videos && videos.length > 0 
          ? `https://www.youtube.com/watch?v=${videos[0].id.videoId}`
          : '#';

        // Split song info into title and artist
        const [songTitle, artistName] = songInfo.split(' - ').map(s => s.trim());

        // Get album/artist image from Last.fm
        const lastfmResponse = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM_API_KEY}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(songTitle)}&format=json`
        );

        let imageUrl = null;
        if (lastfmResponse.data.track && lastfmResponse.data.track.album) {
          // Get the largest image available
          const images = lastfmResponse.data.track.album.image;
          const largestImage = images.find(img => img.size === 'extralarge') || 
                             images.find(img => img.size === 'large') || 
                             images[0];
          imageUrl = largestImage?.['#text'];
        }

        // If no album image, try getting artist image
        if (!imageUrl) {
          const artistResponse = await axios.get(
            `http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=${process.env.LASTFM_API_KEY}&artist=${encodeURIComponent(artistName)}&format=json`
          );

          if (artistResponse.data.artist && artistResponse.data.artist.image) {
            const images = artistResponse.data.artist.image;
            const largestImage = images.find(img => img.size === 'extralarge') || 
                               images.find(img => img.size === 'large') || 
                               images[0];
            imageUrl = largestImage?.['#text'];
          }
        }

        return {
          title: songInfo,
          link: youtubeLink,
          imageUrl: imageUrl || 'https://wikisound.org/mastering/Audio-waveform-player/data/default_artwork/music_ph.png' // Fallback image
        };
      } catch (error) {
        console.error(`Error fetching data for ${songInfo}:`, error);
        return {
          title: songInfo,
          link: '#',
          imageUrl: 'https://wikisound.org/mastering/Audio-waveform-player/data/default_artwork/music_ph.png'
        };
      }
    }));

    res.json({ 
      success: true, 
      recommendations: songsWithLinksAndImages.filter(song => song.link !== '#')
    });
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
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
