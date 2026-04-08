require('dotenv').config();
const axios = require('axios');

const GENIUS_API_BASE = 'https://api.genius.com';
const GENIUS_API_VERSION = '2023.09.27';
const API_KEY = process.env.GENIUS_API_KEY;

console.log('Testing full song response for "Bohemian Rhapsody"...\n');

async function getFullSongResponse() {
  try {
    // Get song details
    const response = await axios.get(`${GENIUS_API_BASE}/songs/1063`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      }
    });
    
    const song = response.data.response.song;
    console.log('Available properties in song object:');
    const props = Object.keys(song).sort();
    props.forEach(prop => {
      const value = song[prop];
      if (typeof value === 'string' && value.length < 100) {
        console.log(`  - ${prop}: "${value}"`);
      } else if (typeof value === 'number') {
        console.log(`  - ${prop}: ${value} (${typeof value})`);
      } else if (value === null || value === undefined) {
        console.log(`  - ${prop}: null/undefined`);
      } else {
        console.log(`  - ${prop}: [${typeof value}, ${value?.length || 0} chars]`);
      }
    });
    
    console.log('\n--- Check if lyrics exists in nested objects ---');
    console.log('song.lyrics:', song.lyrics);
    console.log('song.description:', song.description);
    console.log('song.primary_artist:', song.primary_artist);
    console.log('\nChecking other possible locations for lyrics...');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getFullSongResponse();
