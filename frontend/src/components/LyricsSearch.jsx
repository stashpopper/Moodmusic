import { useState } from 'react';
import '../styles/LyricsSearch.css';

function LyricsSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a song title');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSong(null);
    setSearchPerformed(true);
    
    try {
      const queryParams = new URLSearchParams({
        title: searchTerm.trim(),
        artist: artist.trim()
      });
      
      const response = await fetch(`${BASE_URL}/api/lyrics?${queryParams}`);
      const data = await response.json();
      
      console.log('[Frontend] API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch lyrics');
      }
      
      if (data.success && data.song) {
        // Check if lyrics are available
        if (data.song.lyrics && data.song.lyrics.trim()) {
          setSong({
            title: data.song.title,
            artist: data.song.artist,
            lyrics: data.song.lyrics,
            hasLyrics: true,
            service: data.service || 'lyricsovh'
          });
        } else {
          // Lyrics not available from Lyrics.ovh
          setError(`Lyrics not available from our sources. You can search for another song.`);
        }
      } else {
        setError(data.error || 'No lyrics found for this song');
      }
    } catch (err) {
      console.error('Error fetching lyrics:', err);
      setError(err.message || 'Failed to fetch lyrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClear = () => {
    setSearchTerm('');
    setArtist('');
    setSong(null);
    setError(null);
    setSearchPerformed(false);
  };
  
  return (
    <div className="lyrics-search-container">
      <div className="lyrics-search-header">
        <h2>🎵 Song Lyrics Search</h2>
        <p className="subtitle">Search for any song and view its full lyrics</p>
      </div>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="song-title">Song Title *</label>
          <input
            type="text"
            id="song-title"
            placeholder="Enter song title (e.g., 'Bohemian Rhapsody')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="artist-name">Artist (Optional)</label>
          <input
            type="text"
            id="artist-name"
            placeholder="Enter artist name (e.g., 'Queen')"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>
        
        <div className="search-actions">
          <button 
            type="submit" 
            className="primary-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-loader"></span>
                Searching...
              </>
            ) : (
              'Search Lyrics'
            )}
          </button>
          
          {searchPerformed && (
            <button 
              type="button" 
              className="secondary-btn clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>
          )}
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {song && (
        <div className="lyrics-result">
          <div className="song-header">
            <div className="song-info">
              <h3>{song.title}</h3>
              <p className="artist-name">by {song.artist}</p>
              {song.service && <p className="service-label">Provider: {song.service.toUpperCase()}</p>}
            </div>
          </div>
          
          <div className="lyrics-container">
            <h4>Lyrics</h4>
            <div className="lyrics-content">
              {song.hasLyrics ? (
                <pre>{song.lyrics}</pre>
              ) : (
                <p>
                  Lyrics not available from our sources. 
                  <a href="https://genius.com" target="_blank" rel="noopener noreferrer">
                    Visit Genius.com
                  </a> for lyrics.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!loading && !song && searchPerformed && !error && (
        <div className="empty-state">
          <div className="music-visual">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <p>No lyrics found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}

export default LyricsSearch;
