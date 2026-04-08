const axios = require('axios');

console.log('Testing backend API endpoint (before starting server)...\n');
setTimeout(async () => {
  try {
    const baseUrl = 'http://localhost:5000/api/lyrics';
    const params = new URLSearchParams({title: 'Shape of You', artist: 'Ed Sheeran'});
    
    console.log('Calling:', baseUrl + '?' + params);
    
    const response = await axios.get(baseUrl + '?' + params);
    
    console.log('\n✅ Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Service:', response.data.service);
    console.log('Has Lyrics:', response.data.hasLyrics);
    console.log('Song title:', response.data.song?.title);
    console.log('Song artist:', response.data.song?.artist);
    
    if (response.data.song?.lyrics) {
      console.log('✅ LYRICS FOUND! (', response.data.song.lyrics.split('\n').length, 'lines )');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Hint: Start backend with npm run dev');
    }
  }
}, 1000);
