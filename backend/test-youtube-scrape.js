const axios = require('axios');
const { search } = require('youtube-search-without-api-key');

console.log('Testing YouTube search for lyrics...\n');

async function testYoutube() {
  const songTitle = 'Bohemian Rhapsody Queen';
  
  console.log(`Searching YouTube for "${songTitle}"...`);
  
  try {
    const videos = await search(songTitle, {
      type: 'video',
      maxResults: 1
    });
    
    if (videos.length === 0) {
      console.log('❌ No videos found');
      return;
    }
    
    const video = videos[0];
    console.log(`\n✅ Found YouTube video: ${video.title}`);
    console.log(`ID: ${video.id.videoId}`);
    console.log(`URL: https://www.youtube.com/watch?v=${video.id.videoId}`);
    
    // Try to fetch the video page
    console.log('\nFetching video description...');
    const response = await axios.get(`https://www.youtube.com/watch?v=${video.id.videoId}`);
    
    // Note: YouTube returns HTML, so complete scraping would need a proper parser
    // But the description might contain lyrics
    if (response.data.includes('lyrics')) {
      console.log('✅ Description contains "lyrics"');
    } else {
      console.log('⚠️  No obvious lyrics in page');
    }
    
    console.log('\nConclusion: YouTube is not a reliable source for lyrics');
    console.log('Better to tell users: "Lyrics not available on Genius"');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testYoutube();
