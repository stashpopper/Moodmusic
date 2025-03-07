import { useState, useEffect } from 'react';
import '../styles/Navigation.css';

function Navigation({ activeTab, setActiveTab }) {
    const [darkMode, setDarkMode] = useState(false);
    
    useEffect(() => {
        // Apply theme based on state by adding/removing a class on the document root
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prevMode => !prevMode);
    };
    
    return (
        <nav className="navigation">
            <div className="logo">
                <h2>MusicMood</h2>
            </div>
            <div className="nav-links">
                <button 
                    className={activeTab === 'home' ? 'active' : ''} 
                    onClick={() => setActiveTab('home')}
                >
                    Home
                </button>
                <button 
                    className={activeTab === 'history' ? 'active' : ''} 
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>
            <div className="theme-toggle">
                <span role="img" aria-label="theme" onClick={toggleTheme}>
                    {darkMode ? '☀️' : '🌙'}
                </span>
            </div>
        </nav>
    );
}

export default Navigation;