const axios = require('axios');

async function testApi() {
  console.log('Testing backend API endpoint...\n');
  
  try {
    const response = await axios.get('http://localhost:5000/api/lyrics', {
      params: {
        title: 'Shape of You'
      },
      timeout: 5000
    });
    
    console.log('✅ Backend response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success) {
      console.log('\n🎉 SUCCESS!');
      console.log('Song:', response.data.song.title);
      console.log('Artist:', response.data.song.artist);
      console.log('Has lyrics:', !!response.data.song.lyrics);
    } else {
      console.log('\n❌ Error:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('No response from server. Is backend running?');
    }
  }
}

testApi();
