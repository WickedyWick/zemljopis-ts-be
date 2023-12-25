import type { CreateRoomDto, RoomInfo } from "$lib/types/types";
import { createRoomCode } from '$lib'
import { addRoomCode, createRoom } from '$lib/server'
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
      'players': [data.username],
      'password': data.password
    }
    let success: boolean = await createRoom(roomCode, roomInfo)
    if (!success) {
      // log err
      return undefined
    }
    return roomCode;
  } catch(err) {
    console.log(err);
    
    return undefined
  }
}