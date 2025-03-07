const config = {
  API_URL: import.meta.env.PROD 
    ? 'https://moodmusic-production.up.railway.app'
    : 'http://localhost:5000'
};

export default config;
