import { redisDb } from "."
import { RedisKeys }  from "$lib/utils/types/types"
/*
  ********* KEY SCHEMA *********
  roomSet -> Set of room codes, its faster to keep set than use EXIST since set is (1) and EXIST IS O(n)
*/
export const SET = async(key: string, val: any):Promise<boolean>  => {
  return await redisDb.SET(key, val)
}

export const addRoomCode = async(roomCode: string) => {
  return await redisDb.SADD(RedisKeys.roomSet, roomCode)
}

export const roomExists = async(roomCode: string):Promise<boolean> => {
  
}