import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import redisClient from './redis.js'; // Import our new redis client

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/ping', async (req: Request, res: Response) => {
    // Let's try to set a value in Redis and read it back
    await redisClient.set('test-key', 'Redis is working!');
    const value = await redisClient.get('test-key');

    res.json({ 
        message: "Pong!",
        redis_status: value 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});