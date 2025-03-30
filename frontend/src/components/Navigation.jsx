import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

function Navigation({ activeTab, setActiveTab }) {
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize from localStorage or system preference
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme !== null) {
            return savedTheme === 'true';
        }
        // Check for system preference as fallback
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const { isAuthenticated, user, logout } = useAuth();
    
    useEffect(() => {
        // Apply theme based on state by adding/removing a class on the document root
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        // Save preference to localStorage
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prevMode => !prevMode);
    };
    
    const handleLogout = () => {
        logout();
        // If user is in history tab and logs out, redirect to home
        if (activeTab === 'history') {
            setActiveTab('home');
        }
    };
    
    return (
        <nav className="navigation">
            <div className="logo">
                <h2>MoodMusic</h2>
            </div>
            <div className="nav-links">
                <button 
                    className={activeTab === 'home' ? 'active' : ''} 
                    onClick={() => setActiveTab('home')}
                >
                    Community
                </button>
                <button 
                    className={activeTab === 'recommendations' ? 'active' : ''} 
                    onClick={() => setActiveTab('recommendations')}
                >
                    Recommendations
                </button>
                {isAuthenticated && (
                    <button 
                        className={activeTab === 'history' ? 'active' : ''} 
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                )}
            </div>
            <div className="nav-actions">
                {isAuthenticated ? (
                    <div className="user-menu">
                        <span className="username">Hello, {user?.username}</span>
                        <button className="auth-nav-btn logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <button 
                        className="auth-nav-btn login-btn" 
                        onClick={() => setActiveTab('auth')}
                    >
                        Login / Register
                    </button>
                )}
                <div className="theme-toggle" onClick={toggleTheme}>
                    <span role="img" aria-label="theme">
                        {darkMode ? '☀️' : '🌙'}
                    </span>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;