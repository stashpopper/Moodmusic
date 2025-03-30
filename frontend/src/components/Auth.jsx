import { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

function Auth({ setActiveTab }) {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  
  const toggleForm = () => {
    setIsLogin(prev => !prev);
  };
  
  // Redirect to recommendations page when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('recommendations');
    }
  }, [isAuthenticated, setActiveTab]);
  
  return (
    <div className="auth-container">
      {isLogin ? (
        <Login onToggleForm={toggleForm} />
      ) : (
        <Register onToggleForm={toggleForm} />
      )}
    </div>
  );
}

export default Auth; 