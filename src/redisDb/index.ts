import { createClient } from 'redis'
import * as dotenv from 'dotenv'
import { logError } from 'utils/logger'
import { transactionClient } from './transactionClient'

dotenv.config()

// await this
const redis = createClient({
    url: process.env.REDIS_URL,
})

redis.connect()

export const serveTransactionClient = async(room: string) => {
    const conn = await createClient({
        url: process.env.REDIS_URL,
    })
    if (!conn) {
        await logError(`Error during serving transaction client , conn is null.`)
        throw new Error
    }
    await conn.connect()

    //@ts-ignore
    return new transactionClient(conn, room)
}
export const redisDb = redis