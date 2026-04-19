const axios = require('axios');
const { getPrisma, getDbInitError } = require('../config/db');

const getRecommendations = async (req, res) => {
  try {
    const { mood, language, genre } = req.body;

    const prompt = `You are a music expert. Suggest 5 diverse ${language} ${genre} songs that match the ${mood} theme. Format: Song Title - Artist Name. Give the exact song titles and artist names. `;
    const mistralResponse = await axios.post('https://api.mistral.ai/v1/chat/completions', {
      messages: [{ role: "user", content: prompt }],
      model: "mistral-large-2411",
      temperature: 0.7
    }, {
      headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`, 'Content-Type': 'application/json' }
    });

    const songs = mistralResponse.data.choices[0].message.content.replace(/\*\*([\s\S]*?)\*\*/g, '$1')
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
};

const communitySongs = async (req, res) => {
  try {
    const prisma = getPrisma();
    const { mood, language, genre } = req.query;

    const filter = {};
    if (mood) filter.mood = mood;
    if (language) filter.language = language;
    if (genre) filter.genre = genre;

    const songs = await prisma.songHistory.findMany({
      where: filter,
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json({ success: true, songs });
  } catch (error) {
    console.error('Error fetching community songs:', error);

    const dbInitError = getDbInitError();
    if (dbInitError) {
      return res.status(500).json({
        success: false,
        error: `Database client failed to initialize: ${dbInitError.message}`
      });
    }
    
    // Check if this is a database connection error
    if (error.message.includes('DATABASE_URL') || error.message.includes('database') || error.code === 'P1001') {
      return res.status(500).json({
        success: false, 
        error: 'Database connection not configured. Please set DATABASE_URL in your .env file.'
      });
    }
    
    res.status(500).json({ success: false, error: 'Failed to fetch community songs' });
  }
};

module.exports = { getRecommendations, communitySongs };