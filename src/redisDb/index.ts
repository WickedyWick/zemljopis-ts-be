import { createClient } from 'redis'
import * as dotenv from 'dotenv'

dotenv.config()

const redis = createClient({
    url: process.env.REDIS_HOSTNAME,
})

redis.connect()

export const redisDb = redis