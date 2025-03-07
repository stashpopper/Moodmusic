import { useState, useEffect } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import LastFmImage from './components/LastFmImage'

function App() {
  const [formData, setFormData] = useState({
    mood: '',
    language: '',
    genre: ''
  });
  const [activeTab, setActiveTab] = useState('home');
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      } else {
        throw new Error(data.error || 'Failed to fetch history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history. Please try again later.');
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
    setError(null); // Clear any previous errors
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        
        // Save to history with error handling
        const savePromises = data.recommendations.map(async song => {
          const [songTitle, artist] = song.title.split(' - ').map(s => s.trim());
          try {
            const response = await fetch('http://localhost:5000/api/history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...formData,
                songTitle,
                artist,
                youtubeLink: song.link
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to save to history');
            }
          } catch (error) {
            console.error('Error saving song to history:', error);
          }
        });
        
        await Promise.all(savePromises);
        await fetchHistory(); // Refresh history after all saves complete
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get recommendations. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (songId, feedback) => {
    try {
      const response = await fetch(`http://localhost:5000/api/history/${songId}/feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update feedback');
      }
      
      await fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error updating feedback:', error);
      setError('Failed to update feedback. Please try again.');
    }
  };

  // Add new delete function
  const handleDeleteSong = async (songId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/history/${songId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete song');
      }
      
      // Remove from local state
      setHistory(prevHistory => prevHistory.filter(item => item._id !== songId));
      
    } catch (error) {
      console.error('Error deleting song:', error);
      setError('Failed to delete song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHomePage = () => (
    <>
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="mood">Mood</label>
          <select 
            id="mood"
            name="mood" 
            value={formData.mood}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Mood</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="energetic">Energetic</option>
            <option value="calm">Calm</option>
            <option value="nostalgic">Nostalgic</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="language">Language</label>
          <select 
            id="language"
            name="language" 
            value={formData.language}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="Korean">Korean</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="genre">Genre</label>
          <select 
            id="genre"
            name="genre" 
            value={formData.genre}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Genre/Theme</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="lo-fi">Lo-Fi</option>
            <option value="instrumental">Instrumental</option>
            <option value="romantic">Romantic</option>
            <option value="workout">Workout</option>
          </select>
        </div>

        <button 
          className="primary-btn"
          onClick={getRecommendations}
          disabled={loading || !formData.mood || !formData.language || !formData.genre}
        >
          {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>Your Recommendations</h2>
          <div className="songs-grid">
            {recommendations.map((song, index) => (
              <div key={index} className="song-card">
                <div className="song-image">
                  <LastFmImage 
                    artist={song.title.split(' - ')[1]}
                    track={song.title.split(' - ')[0]}
                  />
                </div>
                <div className="song-info">
                  <h3>{song.title.split(' - ')[0]}</h3>
                  <p className="artist">{song.title.split(' - ')[1]}</p>
                </div>
                <a href={song.link} target="_blank" rel="noopener noreferrer" className="listen-btn">
                  <span className="icon">▶</span>
                  <span>Listen</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderHistoryPage = () => (
    <div className="history-section">
      <h2>Your Listening History</h2>
      {history.length === 0 ? (
        <div className="empty-state">
          <p>You haven't listened to any songs yet.</p>
          <button className="secondary-btn" onClick={() => setActiveTab('home')}>
            Get recommendations
          </button>
        </div>
      ) : (
        <div className="songs-grid history-grid">
          {history.map((item) => (
            <div key={item._id} className="history-card">
              <div className="song-image">
                <LastFmImage 
                  artist={item.artist}
                  track={item.songTitle}
                />
              </div>
              <div className="song-info">
                <h3>{item.songTitle}</h3>
                <p className="artist">{item.artist}</p>
                <div className="tags">
                  <span className="tag mood">{item.mood}</span>
                  <span className="tag genre">{item.genre}</span>
                  <span className="tag language">{item.language}</span>
                </div>
              </div>
              
              <div className="history-actions">
                <a href={item.youtubeLink} target="_blank" rel="noopener noreferrer" className="listen-btn">
                  <span className="icon">▶</span>
                  <span>Listen</span>
                </a>
                
                <div className="song-actions">
                  <div className="feedback-buttons">
                    <button 
                      onClick={() => handleFeedback(item._id, 'like')}
                      className={item.feedback === 'like' ? 'active' : ''}
                      aria-label="Like"
                    >
                      👍
                    </button>
                    <button 
                      onClick={() => handleFeedback(item._id, 'dislike')}
                      className={item.feedback === 'dislike' ? 'active' : ''}
                      aria-label="Dislike"
                    >
                      👎
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteSong(item._id)} 
                    className="delete-btn"
                    aria-label="Delete song"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>
      
      <div className="content">
        <h1>Mood Music Recommender</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {loading && <div className="loading-spinner">Loading...</div>}

        {activeTab === 'home' ? renderHomePage() : renderHistoryPage()}
      </div>
    </div>
  );
}

export default App
