import { redisDb } from "."
import type { RoomInfo }  from "$lib/types/types"
/*
  ********* KEY SCHEMA *********
  roomSet -> Set of room codes, its faster to keep set than use EXIST since set is (1) and EXIST IS O(n)
  room:{roomCode} -> Information about the room
  players:{roomCode} -> Set of players in the room
*/
export const SET = async(key: string, val: any):Promise<boolean>  => {
  return await redisDb.SET(key, val)
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