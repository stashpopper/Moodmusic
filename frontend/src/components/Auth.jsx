import { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import '../styles/Auth.css';

function Auth({ setActiveTab, login, register, isAuthenticated, loading }) {
  const [isLogin, setIsLogin] = useState(true);

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
        <Login onToggleForm={toggleForm} login={login} loading={loading} />
      ) : (
        <Register onToggleForm={toggleForm} register={register} loading={loading} />
      )}
    </div>
  );
}

export default Auth; 