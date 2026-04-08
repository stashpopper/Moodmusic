require('dotenv').config();
const axios = require('axios');

const GENIUS_API_BASE = 'https://api.genius.com';
const GENIUS_API_VERSION = '2023.09.27';
const API_KEY = process.env.GENIUS_API_KEY;

console.log('Testing lyrics for a more modern popular song...\n');

async function testModernSong() {
  try {
    // Use Ed Sheeran's "Shape of You" instead (more likely to have lyrics}
    console.log('Searching for "Shape of You" by Ed Sheeran...');
    
    // Step 1: Search
    const searchRes = await axios.get(`${GENIUS_API_BASE}/search`, {
      params: { q: 'Shape of You Ed Sheeran', per_page: 1 },
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      }
    });
    
    const hit = searchRes.data.response.hits[0];
    const songId = hit.result.id;
    console.log(`Found: "${hit.result.title}" by ${hit.result.primary_artist.name} (ID: ${songId})`);
    
    // Step 2: Get lyrics
    console.log('\nFetching lyrics...');
    const songRes = await axios.get(`${GENIUS_API_BASE}/songs/${songId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      }
    });
    
    const song = songRes.data.response.song;
    console.log(`Has lyrics: ${song.hasOwnProperty('lyrics')}`);
    console.log(`Lyrics state: ${song.lyrics_state}`);
    
    if (song.lyrics) {
      console.log(`
✅ SUCCESS! Got ${song.lyrics.split('\n').length} lines of lyrics!`);
      console.log('\nFirst 5 lines:');
      song.lyrics.split('\n').slice(0, 5).forEach((line, i) => {
        if (line.trim()) console.log(`  ${i + 1}. ${line}`);
      });
    } else {
      console.log('\n❌ No lyrics found for this song either');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testModernSong();
