export type CreateRoomDto = {
  username: string
  playerCount: number
  password: string | undefined
}
export type ClassicDto = {
  [key: string]: any
}

export enum RedisKeys {
  roomSet
}