import { createClient } from 'redis';

const client = await createClient().connect()
const res = await client.ping()
console.log("PONG: ", res)

export const redisDb = client