import { redisDb } from "."
import type { RoomInfo }  from "$lib/types/types"
import { SchemaFieldTypes } from "redis"
/*
  ********* KEY SCHEMA *********
  roomSet -> Set of room codes, its faster to keep set than use EXIST since set is (1) and EXIST IS O(n)
  room:{roomCode} -> Information about the room
  players:{roomCode} -> Set of players in the room
*/

export const addVisitor = async():Promise<number> => {
  return await redisDb.INCR('totalConnections')
}
export const addRoomCode = async(roomCode: string):Promise<boolean> => {
  return Boolean(await redisDb.SADD('roomSet', roomCode))
}

export const roomExists = async(roomCode: string):Promise<boolean> => {
  return Boolean(await redisDb.SISMEMBER('roomSet', roomCode));
}

export const createRoom = async(roomCode: string, data: RoomInfo, player: string):Promise<any[]> => {
  // pipeline
  return await redisDb.MULTI()
    .HSET(`room:${roomCode}`, data)
    .SADD(`players:${roomCode}`, player)
    .EXEC()
}

export const logError = async(msg: string, method: string) => {
  let ts = Date.now()
  await redisDb.HSET(`err:log:${ts}`, {
    msg,
    method,
    time: ts
  })
}

export const logInfo = async(msg: string, method: string) => {
  let ts = Date.now()
  await redisDb.HSET(`err:log:${ts}`, {
    msg,
    method,
    time: ts
  })
}

export const prepDb = async() => {
  // Check for indexes and add if needed
  await checkIfErrLogIndexExists()
  await checkIfInfoLogIndexExists()
}

export const checkIfErrLogIndexExists = async() => {
  try { 
    const res = await redisDb.ft.INFO('idx:err:log')
  } catch(err) {
    await setupErrorLogIndex()
  }
}

export const checkIfInfoLogIndexExists = async() => {
  try { 
    const res = await redisDb.ft.INFO('idx:info:log')
  } catch(err) {
    await setupInfoLogIndex()
  }
}

export const setupErrorLogIndex = async() => {
  await redisDb.ft.create('idx:err:log', {
    time: {
      type: SchemaFieldTypes.NUMERIC,
      SORTABLE: true
    },
    msg: SchemaFieldTypes.TAG,
    method: SchemaFieldTypes.NUMERIC
  }, {
    ON: 'HASH',
    PREFIX: 'err:log:'
  });
}

export const setupInfoLogIndex = async() => {
  await redisDb.ft.create('idx:info:log', {
    time: {
      type: SchemaFieldTypes.NUMERIC,
      SORTABLE: true
    },
    msg: SchemaFieldTypes.TAG,
    method: SchemaFieldTypes.NUMERIC
  }, {
    ON: 'HASH',
    PREFIX: 'info:log:'
  });
}