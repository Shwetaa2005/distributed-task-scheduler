import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to Redis using the URL from our .env file (we will update .env next)
// if no URL is provided, it defaults to localhost:6379
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis successfully!');
});

redisClient.on('error', (err) => {
    console.log('❌ Redis Connection Error:', err);
});

export default redisClient;