export type CreateRoomDto = {
  username: string
  playerCount: number
  password: string
}

export type JoinRoomDto = {
  username: string
  roomCode: string
  password: string
}

export type RoomInfo = {
  currentLetter: string
  playersJoined: number
  playerCount: number
  password: string
  
}
export type ClassicDto = {
  [key: string]: any
}

export enum RedisKeys {
  roomSet,
  room
}