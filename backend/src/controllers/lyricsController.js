const { getLyricsByTitle } = require('../services/lyricsService');

/**
 * Get song lyrics by title
 * GET /api/lyrics
 */
const getLyrics = async (req, res) => {
  try {
    const { title, artist } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Song title is required'
      });
    }
    
    console.log('[Lyrics API] Searching for:', title);
    console.log('[Lyrics API] With artist:', artist || 'Not provided');
    
    // Try to get lyrics from either Lyrics.ovh or Genius
    const result = await getLyricsByTitle(title, artist || '');
    
    console.log('[Lyrics API] Result success:', result.success);
    console.log('[Lyrics API] Lyrics source:', result.source);
    console.log('[Lyrics API] Has lyrics:', result.hasLyrics);
    console.log('[Lyrics API] Error:', result.error);
    
    if (!result.success) {
      // Handle errors
      if (result.error && (result.error.includes('rate limit') || result.error.includes('429'))) {
        return res.status(429).json({
          success: false,
          error: result.error,
          service: result.source || 'lyrics_api'
        });
      }
      
      return res.status(404).json({
        success: false,
        error: result.error || 'Song not found',
        service: result.source || 'lyrics_api'
      });
    }
    
    res.json({
      success: true,
      service: result.source,  // Which API provided lyrics
      song: result.song,
      hasLyrics: result.hasLyrics
    });
  } catch (error) {
    console.error('Error in getLyrics:', error);
    console.error('Error stack:', error.stack);
    
    // Check if this is a 401 error from Genius
    if (error.response && error.response.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired Genius API key. Please check your API key in backend/.env'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lyrics'
    });
  }
};

module.exports = {
  getLyrics
};
