const config = {
  API_URL: import.meta.env.PROD 
    ? 'https://your-backend-url.com' // This will be updated once backend is deployed
    : 'http://localhost:5000'
};

export default config;
