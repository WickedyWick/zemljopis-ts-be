import type { CreateRoomDto, JoinRoomDto, RoomInfo } from "$lib/types/types";
import { createRoomCode } from '$lib'
import { addRoomCode, createRoom, joinRoom } from '$lib/server'
import { logError } from "../db/commands";

export const createRoomService = async(data: CreateRoomDto): Promise<string | undefined> => {
  try {
    let retryCount: number = 5;
    let roomCode: string = ''

    while (retryCount > 0) {
      roomCode = createRoomCode()
      let success: boolean = await addRoomCode(roomCode);
      if (success)
        retryCount = 0
      else {
        roomCode = ''
        retryCount--
      }
    }
    
    if (roomCode == '')
      return undefined

    let roomInfo: RoomInfo = {
      'playerCount': data.playerCount,
      'currentLetter': '',
      'playersJoined': 0,
      'password': data.password
    }
    let success: any[] = await createRoom(roomCode, roomInfo, data.username)
    if (success.length != 2) {
      // log err
      return undefined
    } else if (success[0]['0'] != 4 || success[1]['1'] != 1) {
      // 4 is size of roomInfo
      // log err
      return undefined
    }
    
    return roomCode;
  } catch(err) {
    await logError(String(err), 'createRoomService')
    return undefined
  }
}

export const joinRoomService = async(data: JoinRoomDto) => {
  try {
    return await joinRoom(data.roomCode, data.username)
  } catch(err){
    await logError(String(err), 'joinRoomService')
    return 500
  }
}