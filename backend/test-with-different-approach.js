require('dotenv').config();
const axios = require('axios');

const GENIUS_API_BASE = 'https://api.genius.com';
const GENIUS_API_VERSION = '2023.09.27';
const API_KEY = process.env.GENIUS_API_KEY;

console.log('Testing different approaches to get lyrics...\n');

async function tryAlternativeApproaches() {
  try {
    // Get the song
    console.log('Fetching Bohemian Rhapsody (ID: 1063)...');
    const songRes = await axios.get(`${GENIUS_API_BASE}/songs/1063`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      }
    });
    
    const song = songRes.data.response.song;
    console.log('\n✅ Fetching...');
    console.log(`Title: ${song.title}`);
    console.log(`Lyrics State: ${song.lyrics_state}`);
    console.log(`Verified Lyrics: ${song.verified_lyrics_by ? 'Yes' : 'No'}`);
    console.log(`Has lyrics prop: ${song.hasOwnProperty('lyrics')}`);
    
    // Check if lyrics is protected or behind a different field
    console.log('\n--- Checking all user accessible fields ---');
    console.log('Stats:', song.stats || { lyrictagger_id: 'N/A' });
    
    // The lyrics might be at `song.embed_content` or other HTML field
    if (song.embed_content) {
      console.log(`\nembed_content length: ${song.embed_content.length}`);
      // This might contain an iframe or reference to lyrics
    }
    
    // Try the /song/ID endpoint with different parameters
    console.log('\n--- Checking if lyrics API endpoint is different ---');
    try {
      // Some songs might have a lyrics URL
      const fullResponse = await axios.get(`${GENIUS_API_BASE}/songs/1063?include_annotations=true&include_explanations=true`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
          'X-Genius-API-Version': GENIUS_API_VERSION
        }
      });
      
      const fullSong = fullResponse.data.response.song;
      console.log('With annotations - has lyrics:', fullSong.hasOwnProperty('lyrics'));
      if (fullSong.lyrics) {
        console.log(`\n✅ FOUND LYRICS! (${fullSong.lyrics.length} chars)`);
        console.log('First 100 chars:', fullSong.lyrics.substring(0, 100));
      } else {
        console.log('\n❌ Still no lyrics');
        console.log('Available fields:', Object.keys(fullSong).length, 'total');
      }
    } catch (error) {
      console.log('Alternative approach failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

tryAlternativeApproaches();
