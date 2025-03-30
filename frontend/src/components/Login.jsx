import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

function Login({ onToggleForm }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  
  const { login, loading } = useAuth();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setFormError(result.error || 'Login failed. Please try again.');
    }
  };
  
  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      {formError && <div className="auth-error">{formError}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button primary-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-loader"></span>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
      
      <div className="auth-redirect">
        Don't have an account?{' '}
        <button onClick={onToggleForm} className="text-button">
          Register
        </button>
      </div>
    </div>
  );
}

export default Login; 