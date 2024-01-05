import type { RedisClientType, RedisFunctions, RedisModules, RedisScripts } from "redis";
import { createClient } from 'redis';
import { REDIS_CLIENT_POOL_SIZE } from "$env/static/private";
import { logError } from "./commands";
import type { NumericRange } from "@sveltejs/kit";
/**** Commands that use transactions ****/
let clientPool: RedisClientType<RedisModules, RedisFunctions, RedisScripts>[] = []
let poolSize: number = Number(REDIS_CLIENT_POOL_SIZE ?? 50)

for (let i = 0; i < poolSize; i++) {
  const client = createClient()
  // Not sure if preopning conenction is better or not
  clientPool.push(client)
}

const returnClientToPool = async(poolClient: boolean, client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>) => {
  await client.disconnect()
  if (poolClient)
    clientPool.push(client)
  return
}
// call this from hooks.server.ts module so clients are created on app startup
export const init = ():boolean => {
  return true
}

/********* This idea is questionable *********/
export const joinRoom = async(roomCode: string, username: string): Promise<number> => {
  // get client from the pool 
  let client = clientPool.pop()
  let poolClient: boolean = true

  if (!client) {
    client = await createClient()
    poolClient = false
  }

  try {
    await client.connect()
    // we unwatch keys by closing connection
    await client.watch(`players:${roomCode}`)
    // TODO: OPTIMIZE THIS
    const playerIsMember: boolean = await client.SISMEMBER(`players:${roomCode}`, username)
    if (playerIsMember) {
      await returnClientToPool(poolClient, client)
      return 200
    }
  
    // check if room exists
    const maxPlayer: string | undefined = await client.HGET(`room:${roomCode}`, 'playerCount')
    if (maxPlayer == undefined) {
      await returnClientToPool(poolClient, client)
      return 404
    }

    const currentPlayerCount: number = await client.SCARD(`players:${roomCode}`)
    // roomfull
    if (Number(maxPlayer) >= currentPlayerCount) {
      await returnClientToPool(poolClient, client)
      return 409
    }

    const addedPlayer: number | null = await client.SADD(`players:${roomCode}`, 'string')
    // race condition
    if (addedPlayer == null) {
      returnClientToPool(poolClient, client)
      return 500
    }

    returnClientToPool(poolClient, client)
    return 200
  } catch(err) {
    await logError(String(err), 'joinRoom')
    // return client to thet pool
    await returnClientToPool(poolClient, client)
    return 500
  }
    
}
