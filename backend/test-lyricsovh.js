require('dotenv').config();
const axios = require('axios');

console.log('Testing Lyrics.ovh API...\n');

async function testLyricsOvh() {
  const artists = ['Ed Sheeran', 'Queen'];
  const titles = ['Shape of You', 'Bohemian Rhapsody'];
  
  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i];
    const title = titles[i];
    
    console.log(`\n${i + 1}. Testing "${title}" by ${artist}:`);
    console.log('─'.repeat(60));
    
    try {
      const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
        timeout: 10000
      });
      
      const lyrics = response.data.lyrics;
      
      if (!lyrics || lyrics === "Not found" || lyrics === "No lyrics found" || !lyrics.trim()) {
        console.log('No lyrics found');
        continue;
      }
      
      const lines = lyrics.split('\n');
      const hasRealContent = lines.some(line => line.trim() && !line.includes('[') && !line.includes('('));
      
      if (hasRealContent) {
        console.log('✅ LYRICS FOUND!');
        console.log(`\n   Song: ${title}\n   Artist: ${artist}\n   Lines: ${lines.length}\n`);
        console.log('   First 3 lines:\n');
        lines.slice(0, 3).forEach((line, idx) => {
          if (line.trim()) console.log(`   ${idx + 1}. ${line}`);
        });
        console.log('   ...');
      } else {
        console.log('⚠️  Got lyrics but may be invalid (structure check)');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
      }
    }
  }
  
  console.log('\n3. Testing with simpler artist/title:');
  console.log('─'.repeat(60));
  
  const testArtist = 'Billie Eilish';
  const testTitle = 'Bad Guy';
  
  console.log(`Searching for "${testTitle}" by ${testArtist}...`);
  
  try {
    const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(testArtist)}/${encodeURIComponent(testTitle)}`, {
      timeout: 10000
    });
    
    const lyrics = response.data.lyrics;
    
    if (!lyrics || lyrics === "Not found" || lyrics === "No lyrics found" || !lyrics.trim()) {
      console.log('No lyrics found');
      return;
    }
    
    console.log('✅ SUCCESS!');
    console.log(`\n   Lyrics length: ${lyrics.length} characters`);
    console.log(`   Number of lines: ${lyrics.split('\n').length}\n`);
    
    const lines = lyrics.split('\n');
    console.log('   Sample (first 5 non-empty lines):\n');
    
    let count = 0;
    for (const line of lines) {
      if (line.trim() && count < 5) {
        console.log(`   ${count + 1}. ${line}`);
        count++;
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
    }
  }
}

testLyricsOvh();
