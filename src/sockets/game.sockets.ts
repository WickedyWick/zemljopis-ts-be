import { Server, Socket } from "socket.io";
import { joinRoomInterface } from "utils/socketTypes";
import { Player, Room } from 'database/models'
import { GameData } from "redis/game";
import { joinRoomValidator } from "validators/socketValidator";
import { joinRoom } from "controllers/socketHandlers/game.handler";
export const EVENTS = {
    JOIN_ROOM : 'joinRoom'
}
export const registerGameHandlers = async(io: Server, socket: Socket) => {
    socket.on(EVENTS.JOIN_ROOM, async({ username, roomCode, sessionToken }) => {
        const v: boolean = await joinRoomValidator(io, socket, username, roomCode, sessionToken)
        if (v) joinRoom(io, socket, username, roomCode, sessionToken)
    })
    socket.on('test', () => {
        socket.emit('test')
    })
}