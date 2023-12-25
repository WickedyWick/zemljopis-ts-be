export type CreateRoomDto = {
  username: string
  playerCount: number
  password: string | undefined
}

export type RoomInfo = {
  playerCount: number
  password: string | undefined
  players: string[]
}
export type ClassicDto = {
  [key: string]: any
}

export enum RedisKeys {
  roomSet,
  room
}