require('dotenv').config();
const axios = require('axios');

const GENIUS_API_BASE = 'https://api.genius.com';
const GENIUS_API_VERSION = '2023.09.27';
const API_KEY = process.env.GENIUS_API_KEY;

console.log('Testing "Bohemian Rhapsody" lyrics fetch...\n');

async function getSong() {
  try {
    // Step 1: Search
    console.log('1. Searching for "Bohemian Rhapsody"...');
    const searchResponse = await axios.get(`${GENIUS_API_BASE}/search`, {
      params: { q: 'Bohemian Rhapsody', per_page: 1 },
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      }
    });
    
    if (!searchResponse.data.response || !searchResponse.data.response.hits || searchResponse.data.response.hits.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    const firstHit = searchResponse.data.response.hits[0].result;
    console.log(`2. Found song: "${firstHit.title}" by ${firstHit.primary_artist.name}`);
    console.log(`   Song ID: ${firstHit.id}`);
    
    // Step 2: Get lyrics
    console.log('\n3. Getting lyrics...');
    const lyricsResponse = await axios.get(`${GENIUS_API_BASE}/songs/${firstHit.id}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      }
    });
    
    const song = lyricsResponse.data.response.song;
    console.log(`\n4. Song details:`);
    console.log(`   Title: ${song.title}`);
    console.log(`   Artist: ${song.primary_artist.name}`);
    console.log(`   Has lyrics property: ${song.hasOwnProperty('lyrics')}`);
    console.log(`   Lyrics value: ${song.lyrics}`);
    console.log(`   Lyrics is null: ${song.lyrics === null}`);
    console.log(`   Lyrics is undefined: ${song.lyrics === undefined}`);
    console.log(`   Lyrics length: ${song.lyrics ? song.lyrics.length : 'N/A'}`);
    
    if (song.lyrics) {
      console.log(`\n5. ✅ SUCCESS! Got ${song.lyrics.split('\n').length} lines of lyrics`);
      console.log('\n6. First 5 lines:');
      song.lyrics.split('\n').slice(0, 5).forEach((line, i) => {
        if (line.trim()) console.log(`   ${i + 1}. ${line}`);
      });
    } else {
      console.log('\n5. ⚠️  Lyrics is null or empty');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

getSong();
