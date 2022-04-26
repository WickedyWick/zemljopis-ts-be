import { Server, Socket } from 'socket.io'
import { GameData } from 'redis/game'
export const joinRoom = async(io: Server, socket: Socket, username: string, roomCode: string, sessionToken: string) => {
    if (!await GameData.roomExists(roomCode)) return // some socket handler
    const room = new GameData(roomCode)
    if (!await room.playerExists(username)) return
}