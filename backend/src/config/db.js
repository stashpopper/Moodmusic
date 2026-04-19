require('dotenv').config();

let prisma = null;
let dbInitError = null;

try {
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { PrismaClient } = require('@prisma/client');

    const connectionString = process.env.DATABASE_URL;

    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} catch (error) {
    dbInitError = error;
    console.error('[db] Failed to initialize Prisma/Postgres:', error.message);
}

const getPrisma = () => {
    if (dbInitError) {
        throw dbInitError;
    }

    if (!prisma) {
        throw new Error('Database client is not initialized');
    }

    return prisma;
};

const getDbInitError = () => dbInitError;

module.exports = {
    getPrisma,
    getDbInitError
};
