import { useState, useEffect } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import LastFmImage from './components/LastFmImage'
import Auth from './components/Auth'
import Community from './components/Community'
import { useAuth } from './context/AuthContext'

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
  
  const { isAuthenticated, user } = useAuth();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch history on component mount and when authentication status changes
  useEffect(() => {
    if (isAuthenticated && activeTab === 'history') {
      fetchHistory();
    }
  }, [isAuthenticated, activeTab]);

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/protected/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
      const response = await fetch(`${BASE_URL}/api/recommendations`, {
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
        
        // Only save to history if user is authenticated
        if (isAuthenticated) {
          // Save to history with error handling
          const savePromises = data.recommendations.map(async song => {
            const [songTitle, artist] = song.title.split(' - ').map(s => s.trim());
            try {
              const token = localStorage.getItem('authToken');
              const response = await fetch(`${BASE_URL}/api/protected/history`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
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
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/protected/history/${songId}/feedback`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const handleDeleteSong = async (songId) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/protected/history/${songId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
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

  const renderRecommendationsPage = () => (
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
            <option value="">Select Genre</option>
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
          className="primary-btn"
          onClick={getRecommendations}
          disabled={loading || !formData.mood || !formData.language || !formData.genre}
        >
          {loading ? (
            <>
              <span className="btn-loader"></span>
              Getting Recommendations...
            </>
          ) : (
            <>
              <span className="btn-icon">🎵</span>
              Get Recommendations
            </>
          )}
        </button>
      </div>

      {recommendations.length > 0 ? (
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
                  <div className="tags">
                    <span className="tag mood">{formData.mood}</span>
                    <span className="tag language">{formData.language}</span>
                    <span className="tag genre">{formData.genre}</span>
                  </div>
                </div>
                <a href={song.link} target="_blank" rel="noopener noreferrer" className="listen-btn">
                  <span className="icon">▶</span>
                  <span>Listen</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="welcome-section">
          <div className="music-visual">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <h2>Get Personalized Music Recommendations</h2>
          <p>Choose your mood, language, and genre preferences above to get AI-powered music recommendations just for you.</p>
          {!isAuthenticated && (
            <div className="auth-prompt">
              <p>Want to save your recommendations? <button className="text-button" onClick={() => setActiveTab('auth')}>Login or Register</button></p>
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderHistoryPage = () => {
    // If not authenticated, prompt to login
    if (!isAuthenticated) {
      return (
        <div className="auth-required-message">
          <div className="music-visual">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <h2>Login Required</h2>
          <p>Please login to view your listening history.</p>
          <button className="primary-btn" onClick={() => setActiveTab('auth')}>
            Login / Register
          </button>
        </div>
      );
    }
    
    return (
      <div className="history-section">
        <h2>Your Listening History</h2>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="music-visual">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <p>You haven't listened to any songs yet.</p>
            <button className="secondary-btn" onClick={() => setActiveTab('recommendations')}>
              <span className="btn-icon">🎵</span>
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
                    <span className="tag language">{item.language}</span>
                    <span className="tag genre">{item.genre}</span>
                  </div>
                </div>
                
                <div className="history-actions">
                  <div className="feedback-buttons">
                    <button 
                      className={item.feedback === 'liked' ? 'active' : ''}
                      onClick={() => handleFeedback(item._id, 'liked')}
                      title="Like"
                    >
                      👍
                    </button>
                    <button 
                      className={item.feedback === 'disliked' ? 'active' : ''}
                      onClick={() => handleFeedback(item._id, 'disliked')}
                      title="Dislike"
                    >
                      👎
                    </button>
                  </div>
                  
                  <a href={item.youtubeLink} target="_blank" rel="noopener noreferrer" className="listen-btn">
                    <span className="icon">▶</span>
                    <span>Listen Again</span>
                  </a>
                </div>
                
                <div className="song-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteSong(item._id)}
                    title="Delete from history"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Community />;
      case 'recommendations':
        return renderRecommendationsPage();
      case 'history':
        return renderHistoryPage();
      case 'auth':
        return <Auth setActiveTab={setActiveTab} />;
      default:
        return <Community />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>
      
      <div className="content">
        <h1>MoodMusic</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {activeTab !== 'auth' && loading && (
          <div className="loading-spinner">
            <div className="music-visual">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <p>Loading...</p>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}

export default App;
