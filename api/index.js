// Serverless function for Vercel
const app = require('../backend/server');

// For Vercel serverless functions, we need to handle OPTIONS requests
// and ensure CORS headers are properly set for the Netlify frontend
app.use((req, res, next) => {
  // Set CORS headers specifically for your Netlify app
  res.setHeader('Access-Control-Allow-Origin', 'https://themoodmusic.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Test route to verify the API is working
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Backend API is working!' });
});

// Export the app for Vercel
module.exports = app;