import { useState } from 'react';
import '../styles/Auth.css';

function Register({ onToggleForm, register, loading }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');


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

    if (!formData.username.trim()) {
      setFormError('Please enter a username');
      return;
    }
    if (formData.username.trim().length < 3) {
      setFormError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      setFormError('Username can only contain letters, numbers, and underscores');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!formData.password) {
      setFormError('Please enter a password');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    if (!result.success) {
      setFormError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Register</h2>
      {formError && <div className="auth-error">{formError}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
          />
        </div>

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
            placeholder="Create a password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
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
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="auth-redirect">
        Already have an account?{' '}
        <button onClick={onToggleForm} className="text-button">
          Login
        </button>
      </div>
    </div>
  );
}

export default Register; 