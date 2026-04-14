const { PrismaClient } = require('@prisma/client');

console.log('Testing database connection...\n');

try {
  const prisma = new PrismaClient();
  
  prisma.songHistory.findMany({ take: 5 })
    .then(result => {
      console.log('✅ Query successful!');
      console.log('Found', result.length, 'songs');
      console.log('Sample song:', result[0] || 'No songs');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Query failed:');
      console.error('Error:', error.message);
      console.error('Error code:', error.code);
      console.error('\nThis is expected if DATABASE_URL is not set.');
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Prisma client creation failed:');
  console.error('Error:', error.message);
  console.error('Error code:', error.code);
  process.exit(1);
}
