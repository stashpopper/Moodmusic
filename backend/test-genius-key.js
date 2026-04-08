#!/usr/bin/env node
/**
 * Test script to verify Genius API key
 */

require('dotenv').config({ path: '.env' }); // Load .env file

const axios = require('axios');

// Get the API key - try both with and without quotes
const rawKey = process.env.GENIUS_API_KEY;
console.log('Raw API Key:', rawKey);
console.log('Has quotes:', rawKey && (rawKey.startsWith("'") || rawKey.startsWith('"')));
console.log('Trimmed:', rawKey ? rawKey.trim() : 'undefined');

// Try with quotes removed
const cleanKey = rawKey ? rawKey.replace(/^['"]|['"]$/g, '').trim() : '';
console.log('Cleaned API Key:', cleanKey);

const API_BASE = 'https://api.genius.com';
const API_VERSION = '2023.09.27';

// Try the search endpoint
console.log('\n🔍 Testing Genius API with your key...\n');

if (!cleanKey || cleanKey === 'your_genius_api_key_here' || !cleanKey.trim()) {
  console.log('❌ ERROR: GENIUS_API_KEY is not set or is the placeholder value');
  console.log('Please set a valid API key in backend/.env');
  console.log('Get one from: https://genius.com/api-clients');
  process.exit(1);
}

axios.get(`${API_BASE}/search`, {
  params: {
    q: 'Shape of You',
    per_page: 1
  },
  headers: {
    'Authorization': `Bearer ${cleanKey}`,
    'Accept': 'application/json',
    'X-Genius-API-Version': API_VERSION
  }
})
.then(response => {
  if (response.data.response) {
    console.log('✅ SUCCESS! API key is valid');
    console.log(`Found ${response.data.response.hits.length} result(s)`);
    if (response.data.response.hits.length > 0) {
      const firstHit = response.data.response.hits[0].result;
      console.log(`\n📊 First result:`);
      console.log(`   Title: ${firstHit.title}`);
      console.log(`   Artist: ${firstHit.primary_artist.name}`);
      console.log(`   ID: ${firstHit.id}`);
    }
  } else {
    console.log('⚠️  API returned no results');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  }
})
.catch(error => {
  console.log('❌ ERROR: API request failed');
  console.log('Status:', error.response?.status);
  
  if (error.response) {
    if (error.response.status === 401) {
      console.log('\n🔐 UNAUTHORIZED (401)');
      console.log('Possible reasons:');
      console.log('1. API key is invalid or expired');
      console.log('2. API key needs to be activated');
      console.log('3. Account not approved yet');
      console.log('4. Key format is incorrect');
      console.log('\nActions:');
      console.log('- Check if you copied the key correctly from https://genius.com/api-clients');
      console.log('- Log in to genius.com → Settings → API Clients');
      console.log('- Try generating a new key');
      console.log('- Make sure your account is fully verified');
      console.log('\nNote: New API keys may take a few minutes to become active');
    } else if (error.response.status === 403) {
      console.log('\n🚫 FORBIDDEN (403)');
      console.log('Response:', error.response.data);
    } else {
      console.log('Response:', error.response.data);
    }
  } else {
    console.log('Error:', error.message);
  }
});
