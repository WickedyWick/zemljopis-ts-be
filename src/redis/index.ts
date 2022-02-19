import { createClient } from '@node-redis/client';
import * as dotenv from 'dotenv'
dotenv.config()

export const redisDb = createClient({
    'url': process.env.REDIS_HOSTNAME,
})
