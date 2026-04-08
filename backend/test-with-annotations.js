require('dotenv').config();
const axios = require('axios');

const GENIUS_API_BASE = 'https://api.genius.com';
const GENIUS_API_VERSION = '2023.09.27';
const API_KEY = process.env.GENIUS_API_KEY;

console.log('Checking if annotations contain lyrics...\n');

async function testWithAnnotations() {
  try {
    console.log('Getting "Shape of You" with annotations...\n');
    
    const response = await axios.get(`${GENIUS_API_BASE}/songs/2949128?include_annotations=true`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'X-Genius-API-Version': GENIUS_API_VERSION
      }
    });
    
    const song = response.data.response.song;
    console.log('Lyrics state:', song.lyrics_state);
    console.log('Has lyrics property:', song.hasOwnProperty('lyrics'));
    console.log('Has annotations:', song.annotations && song.annotations.length > 0);
    
    // Check annotations for lyrics
    if (song.annotations && song.annotations.length > 0) {
      console.log(`\nFound ${song.annotations.length} annotations`);
      console.log('\n--- Checking annotations for lyrics-like content ---\n');
      
      let lyricsFound = false;
      let annotationCount = 0;
      
      for (const ann of song.annotations) {
        // Skip contributor/community annotations
        if (ann.type !== 'verse' && ann.type !== 'chorus' && ann.type !== 'song') continue;
        
        annotationCount++;
        const body = ann.body?.dom?.children?.[0]?.children?.[0]?.value || '';
        
        if (body && body.length > 10) {
          if (body.toLowerCase().includes('verse') || body.toLowerCase().includes('chorus') || body.length > 50) {
            console.log(`\n${ann.type.toUpperCase()} (${ann.annotation_id}):`);
            console.log(`  ${body.split('\n').slice(0, 5).join('\n  ')}...`);
            
            if (!lyricsFound) {
              lyricsFound = true;
              console.log('\n✅ Potential lyrics found!');
            }
          }
        }
      }
      
      if (!lyricsFound) {
        console.log('\nNo traditional lyrics structure found in annotations');
        console.log('You may need to scrape from the HTML page instead');
      }
    } else {
      console.log('\nNo annotations available');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) console.error('Status:', error.response.status);
  }
}

testWithAnnotations();
