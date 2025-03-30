// Environment-aware API URL configuration
const config = {
  API_URL: import.meta.env.VITE_API_URL || 
           (window.location.hostname === 'localhost' ? 
             'http://localhost:5000' : 
             'https://your-vercel-backend-url.vercel.app')
};

export default config;
