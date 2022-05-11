import { Server, Socket } from "socket.io";
import { joinRoomValidator, playeReadyValidator } from "validators/socketValidator";
import { joinRoom, playerReady, playerUnReady } from "controllers/socketHandlers/game.handler";
export const EVENTS = {
    JOIN_ROOM : 'joinRoom',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_READY: 'playerReady',
    PLAYER_UNREADY: 'playerUnReady'
}
export const registerGameHandlers = async(io: Server, socket: Socket) => {
    socket.on(EVENTS.JOIN_ROOM, async({ username, roomCode, sessionToken }) => {
        const v: boolean = await joinRoomValidator(io, socket, username, roomCode, sessionToken)
        if (v) joinRoom(io, socket, username, roomCode)
    })

    socket.on(EVENTS.PLAYER_READY, async({ username, roomCode, sessionToken }) => {
        const v: boolean = await playeReadyValidator(io, socket, username, roomCode, sessionToken)
        if (v) playerReady(io, socket, username, roomCode)
    })

    socket.on(EVENTS.PLAYER_UNREADY, async({ username, roomCode, sessionToken }) => {
        const v: boolean = await playeReadyValidator(io, socket, username, roomCode, sessionToken)
        if (v) playerUnReady(io, socket, username, roomCode)
    })
    socket.on('test', () => {
        socket.emit('test')
    })
}