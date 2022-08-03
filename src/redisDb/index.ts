import { createClient } from 'redis'
import * as dotenv from 'dotenv'

dotenv.config()

// await this
const redis = createClient({
    url: process.env.REDIS_URL,
})

redis.connect()

export const redisDb = redis