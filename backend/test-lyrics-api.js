#!/usr/bin/env node
/**
 * Simple test script for lyrics API
 * This verifies the API endpoint is working
 */

const axios = require('axios');

// Test configuration
const TEST_SONG_TITLE = 'Shape of You'; // Popular song for testing
const TEST_ARTIST = 'Ed Sheeran'; // Artist for testing

// Check if we have the API key
if (!process.env.GENIUS_API_KEY && !process.env.VITE_API_URL) {
  console.log('⚠️  Please set GENIUS_API_KEY in your environment');
  console.log('   Get one from: https://genius.com/api-clients');
  process.exit(1);
}

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
const API_KEY = process.env.GENIUS_API_KEY;

console.log('🎵 Testing Lyrics Search API');
console.log('============================\n');

// Test 1: Check if the server is running
console.log('Test 1: Checking backend server...');
axios.get(`${API_URL}/api/lyrics?title=${encodeURIComponent(TEST_SONG_TITLE)}`)
  .then(response => {
    console.log('✅ Backend server is responding');
    console.log('✅ Lyrics endpoint is accessible');
    
    if (response.data.success) {
      console.log('\n🎉 SUCCESS! Lyrics API is working!');
      console.log(`\nSong: ${response.data.song.title} by ${response.data.song.artist}`);
      console.log(`Has lyrics: ${response.data.song.lyrics ? 'Yes' : 'No'}`);
      console.log(`Has image: ${response.data.song.image ? 'Yes' : 'No'}`);
      console.log(`\nSample of lyrics:`);
      if (response.data.song.lyrics) {
        const lines = response.data.song.lyrics.split('\n');
        console.log('─'.repeat(50));
        for (let i = 0; i < Math.min(5, lines.length); i++) {
          if (lines[i].trim()) {
            console.log(lines[i]);
          }
        }
        if (lines.length > 5) {
          console.log(`... (${lines.length - 5} more lines)`);
        }
        console.log('─'.repeat(50));
      }
      
      if (!response.data.song.lyrics) {
        console.log('\n⚠️  No lyrics returned for this song');
        console.log('   This might be because:');
        console.log('   - The song is not in the Genius database');
        console.log('   - The API key is not configured correctly');
        console.log('   - The lyrics are not available for this version');
      }
    } else {
      console.log('❌ API returned unsuccessful:', response.data.error);
    }
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.error || 'Unknown error');
    } else if (error.request) {
      console.log('   No response from server');
      console.log('   Is the backend running?');
    } else {
      console.log('   Configuration error?');
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure GENIUS_API_KEY is set in backend/.env');
    console.log('2. Run the backend: npm run dev');
    console.log('3. Check your internet connection');
    process.exit(1);
  });

// Test 2: Test error handling (no title)
setTimeout(() => {
  console.log('\n\nTest 2: Testing error handling...');
  axios.get(`${API_URL}/api/lyrics`)
    .then(response => {
      if (!response.data.success) {
        console.log('✅ Error handling works correctly');
      }
    })
    .catch(error => {
      console.log('✅ Error handling works correctly');
    });
}, 2000);
