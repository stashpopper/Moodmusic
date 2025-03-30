import { useState, useEffect } from 'react';
import LastFmImage from './LastFmImage';
import '../styles/Community.css';

function Community() {
  const [formData, setFormData] = useState({
    mood: '',
    language: '',
    genre: ''
  });
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(6);
  
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Fetch all songs on component mount and when filter changes
  useEffect(() => {
    fetchCommunitySongs();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [formData]);
  
  const fetchCommunitySongs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from filter values
      const queryParams = new URLSearchParams();
      if (formData.mood) queryParams.append('mood', formData.mood);
      if (formData.language) queryParams.append('language', formData.language);
      if (formData.genre) queryParams.append('genre', formData.genre);
      
      const queryString = queryParams.toString();
      const url = `${BASE_URL}/api/community${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSongs(data.songs);
      } else {
        throw new Error(data.error || 'Failed to fetch community songs');
      }
    } catch (error) {
      console.error('Error fetching community songs:', error);
      setError('Failed to load community songs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClearFilters = () => {
    setFormData({
      mood: '',
      language: '',
      genre: ''
    });
  };
  
  // Get current songs for pagination
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = songs.slice(indexOfFirstSong, indexOfLastSong);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Calculate total pages
  const totalPages = Math.ceil(songs.length / songsPerPage);
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="community-container">
      <div className="filters-section">
        <h2>Community Songs</h2>
        <p className="filter-intro">Discover songs shared by the community:</p>
        
        <div className="filter-form">
          <div className="filter-group">
            <label htmlFor="mood-filter">Mood</label>
            <select 
              id="mood-filter"
              name="mood" 
              value={formData.mood}
              onChange={handleInputChange}
            >
              <option value="">All Moods</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="energetic">Energetic</option>
              <option value="calm">Calm</option>
              <option value="nostalgic">Nostalgic</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="language-filter">Language</label>
            <select 
              id="language-filter"
              name="language" 
              value={formData.language}
              onChange={handleInputChange}
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="Korean">Korean</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="genre-filter">Genre</label>
            <select 
              id="genre-filter"
              name="genre" 
              value={formData.genre}
              onChange={handleInputChange}
            >
              <option value="">All Genres</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hiphop">Hip Hop</option>
              <option value="indie">Indie</option>
              <option value="classical">Classical</option>
              <option value="jazz">Jazz</option>
              <option value="electronic">Electronic</option>
              <option value="rnb">R&B</option>
              <option value="folk">Folk</option>
              <option value="instrumental">Instrumental</option>
              <option value="romantic">Romantic</option>
              <option value="workout">Workout</option>
            </select>
          </div>
          
          <button 
            className="secondary-btn clear-filter-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">
          <div className="music-visual">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <p>Loading songs...</p>
        </div>
      ) : songs.length > 0 ? (
        <>
          <div className="songs-grid community-grid">
            {currentSongs.map((song) => (
              <div key={song._id} className="song-card community-card">
                <div className="song-image">
                  <LastFmImage 
                    artist={song.artist}
                    track={song.songTitle}
                  />
                </div>
                <div className="song-info">
                  <h3>{song.songTitle}</h3>
                  <p className="artist">{song.artist}</p>
                  <div className="tags">
                    <span className="tag mood">{song.mood}</span>
                    <span className="tag language">{song.language}</span>
                    <span className="tag genre">{song.genre}</span>
                  </div>
                </div>
                <a href={song.youtubeLink} target="_blank" rel="noopener noreferrer" className="listen-btn">
                  <span className="icon">▶</span>
                  <span>Listen</span>
                </a>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                &laquo; Prev
              </button>
              
              <div className="page-numbers">
                {pageNumbers.map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next &raquo;
              </button>
            </div>
          )}
          
          <div className="results-info">
            Showing {indexOfFirstSong + 1}-{Math.min(indexOfLastSong, songs.length)} of {songs.length} songs
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="music-visual">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <p>No songs found with these filters. Try adjusting your criteria or check back later!</p>
          <button className="secondary-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Community; 