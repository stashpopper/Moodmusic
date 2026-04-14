require('dotenv').config();

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

console.log('Testing Supabase PostgreSQL connection...\n');

// Use the connection string from .env
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.cjxcwyyrwatryavfaixy:Hr3@gmail.com@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

console.log('Connection string:', DATABASE_URL ? 'SET' : 'NOT SET');

try {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Prisma client created successfully!\n');
  
  prisma.songHistory.findMany({ take: 5 })
    .then(result => {
      console.log('✅ Database query successful!');
      console.log('Found', result.length, 'songs in the database');
      
      if (result.length > 0) {
        console.log('\nSample song:');
        console.log('- Title:', result[0].songTitle);
        console.log('- Artist:', result[0].artist);
        console.log('- Mood:', result[0].mood);
        console.log('- Language:', result[0].language);
        console.log('- Genre:', result[0].genre);
      }
      
      pool.end();
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database query failed:');
      console.error('Error:', error.message);
      console.error('\nThis could be due to:');
      console.error('- Invalid credentials');
      console.error('- Network connectivity issues');
      console.error('- Firewall restrictions');
      pool.end();
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Prisma client creation failed:');
  console.error('Error:', error.message);
  process.exit(1);
}
