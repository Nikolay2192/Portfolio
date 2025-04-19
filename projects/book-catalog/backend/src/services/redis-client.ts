import { createClient } from "redis";
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
    console.error('Redis client failed!', err);
})

redisClient.on('connect', () => {
    console.log('Redis connected');
})

redisClient.connect();

export default redisClient;