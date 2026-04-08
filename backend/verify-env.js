require('dotenv').config();

console.log('Checking environment variables:\n');

const keys = ['GENIUS_API_KEY', 'MISTRAL_API_KEY', 'JWT_SECRET', 'DATABASE_URL'];

keys.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: [${value.length} chars]`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

console.log('\n--- Detailed GENIUS_API_KEY check ---');
const geniusKey = process.env.GENIUS_API_KEY || '';
console.log('Raw value:', geniusKey);
console.log('Is placeholder:', geniusKey === 'your_genius_api_key_here');
console.log('Has content:', !!geniusKey && geniusKey !== 'your_genius_api_key_here');
console.log('Length:', geniusKey.length);
