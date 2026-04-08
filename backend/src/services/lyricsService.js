const axios = require('axios');

const GENIUS_API_BASE = 'https://api.genius.com';
const GENIUS_API_VERSION = '2023.09.27';

/**
 * Search for songs on Genius (fallback only)
 * @param {string} songTitle - The title of the song to search for
 * @param {string} accessToken - Genius API access token
 * @returns {Promise<Object>} - Search results
 */
const searchSongs = async (songTitle, accessToken) => {
  try {
    const response = await axios.get(`${GENIUS_API_BASE}/search`, {
      params: {
        q: songTitle,
        per_page: 5
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('[lyricsService] Error searching on Genius:', error.message);
    return null;
  }
};

/**
 * Get song lyrics from Lyrics.ovh API - PRIMARY SOURCE
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Promise<Object>} - { lyrics: string, error: string }
 */
const getLyricsOvh = async (artist, title) => {
  try {
    const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
      timeout: 10000
    });
    
    const lyrics = response.data.lyrics;
    
    if (!lyrics || lyrics === "Not found" || lyrics === "No lyrics found" || !lyrics.trim()) {
      return { lyrics: null, error: 'No lyrics found' };
    }
    
    return { lyrics, error: null };
  } catch (error) {
    let errorMsg = error.message;
    if (error.response) {
      if (error.response.status === 404) {
        errorMsg = 'No lyrics found';
      } else if (error.response.status === 403) {
        errorMsg = 'Lyrics.ovh rate limit exceeded - please try again later';
      } else {
        errorMsg = `Lyrics.ovh error: ${error.response.status}`;
      }
    }
    
    return { lyrics: null, error: errorMsg };
  }
};

/**
 * Get lyrics by song title - uses Lyrics.ovh as primary source
 * @param {string} songTitle - The title of the song
 * @param {string} artistName - The artist name (optional)
 * @param {string} geniusToken - Genius API token (optional, fallback)
 * @returns {Promise<Object>} - { success: bool, source: string, song: object, hasLyrics: bool, error: string }
 */
const getLyricsByTitle = async (songTitle, artistName = '', geniusToken = '') => {
  try {
    let lyrics = null;
    let error = null;
    
    // PRIMARY: Try Lyrics.ovh API (free, uncensored, returns real lyrics)
    if (artistName) {
      console.log('[lyricsService] Trying Lyrics.ovh API first...');
      const lyricsOvh = await getLyricsOvh(artistName, songTitle);
      
      if (lyricsOvh.lyrics) {
        lyrics = lyricsOvh.lyrics;
        console.log('[lyricsService] ✅ SUCCESS! Got lyrics from Lyrics.ovh');
        
        return {
          success: true,
          source: 'lyricsovh',
          song: {
            id: null,
            title: songTitle,
            artist: artistName,
            image: null,
            lyrics: lyrics,
            url: null
          },
          hasLyrics: true,
          error: null
        };
      } else {
        console.log('[lyricsService] Lyrics.ovh: ' + lyricsOvh.error);
        error = lyricsOvh.error;
      }
    }
    
    // If we reach here, Lyrics.ovh didn't work - try Genius (fallback)
    if (!lyrics && geniusToken && artistName) {
      console.log('[lyricsService] Trying Genius API (fallback)...');
      
      try {
        const searchResults = await searchSongs(songTitle, geniusToken);
        
        if (!searchResults?.response?.hits || searchResults.response.hits.length === 0) {
          throw new Error('Song not found');
        }
        
        let selectedHit = searchResults.response.hits[0];
        
        if (artistName) {
          const matchingHit = searchResults.response.hits.find(hit => 
            hit.result.primary_artist?.name && 
            hit.result.primary_artist.name.toLowerCase().includes(artistName.toLowerCase())
          );
          if (matchingHit) {
            selectedHit = matchingHit;
          }
        }
        
        const songId = selectedHit.result.id;
        const songData = await axios.get(`${GENIUS_API_BASE}/songs/${songId}`, {
          headers: {
            'Authorization': `Bearer ${geniusToken}`,
            'Accept': 'application/json',
            'X-Genius-API-Version': GENIUS_API_VERSION
          },
          timeout: 10000
        });
        
        const song = songData.data.response.song;
        const hasLyrics = song.lyrics !== undefined && song.lyrics !== null && song.lyrics !== '';
        
        if (hasLyrics) {
          lyrics = song.lyrics;
          console.log('[lyricsService] ✅ Got lyrics from Genius (fallback)');
          
          return {
            success: true,
            source: 'genius',
            song: {
              id: song.id,
              title: song.title,
              artist: song.primary_artist?.name || 'Unknown Artist',
              image: song.song_art_image_thumbnail?.url ||
                     song.album?.cover_art_thumbnail?.url ||
                     'https://via.placeholder.com/150x150/333/fff?text=No+Image',
              lyrics: song.lyrics,
              url: song.url || 'https://genius.com'
            },
            hasLyrics: true,
            error: null
          };
        } else {
          console.log('[lyricsService] Genius: no lyrics available');
          return {
            success: false,
            source: 'lyricsovh',  // Try for empty
            song: null,
            hasLyrics: false,
            error: 'Lyrics not available on any source'
          };
        }
      } catch (error) {
        console.error('[lyricsService] Genius error:', error.message);
        return {
          success: false,
          source: 'lyricsovh',
          song: null,
          hasLyrics: false,
          error: error.message || 'Failed to fetch lyrics'
        };
      }
    }
    
    // Still no lyrics
    return {
      success: false,
      source: 'lyricsovh',
      song: null,
      hasLyrics: false,
      error: error || 'No lyrics available from any source'
    };
  } catch (error) {
    console.error('[lyricsService] Error in getLyricsByTitle:', error.message);
    
    return {
      success: false,
      source: 'error',
      song: null,
      hasLyrics: false,
      error: error.message || 'Failed to fetch lyrics'
    };
  }
};

/**
 * Get lyrics from Lyrics.ovh directly
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Promise<Object>} - { lyrics: string, error: string }
 */
const fetchLyrics = async (artist, title) => {
  return getLyricsOvh(artist, title);
};

module.exports = {
  searchSongs,
  getLyricsOvh,
  getLyricsByTitle,
  fetchLyrics
};
