import { Server, Socket } from "socket.io";
import { joinRoomValidator, playerReadyValidator, playerUnReadyValidator, receiveDataValidator } from "validators/socketValidator";
import { joinRoom, playerReady, playerUnReady, receiveData } from "controllers/socketHandlers/game.handler";
import { GameData } from "redisDb/game";
export const EVENTS = {
    JOIN_ROOM : 'joinRoom',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_READY: 'playerReady',
    PLAYER_UNREADY: 'playerUnReady',
    RECEIVE_DATA: 'receiveData',
    GAME_START: 'gameStart'
} as const

export const registerGameHandlers = async(io: Server, socket: Socket) => {

    socket.on(EVENTS.JOIN_ROOM, async({ username, roomCode, sessionToken }) => {
        const v: boolean = await joinRoomValidator(io, socket, username, roomCode, sessionToken)
        if (v) joinRoom(io, socket, username, roomCode)
    })

    socket.on(EVENTS.PLAYER_READY, async({ username, roomCode, sessionToken }) => {
        const v: boolean = await playerReadyValidator(io, socket, username, roomCode, sessionToken)
        if (v) playerReady(io, socket, username, roomCode)
    })

    socket.on(EVENTS.PLAYER_UNREADY, async({ username, roomCode, sessionToken }) => {
        const v: boolean = await playerUnReadyValidator(io, socket, username, roomCode, sessionToken)
        if (v) playerUnReady(io, socket, username, roomCode)
    })

    socket.on(EVENTS.RECEIVE_DATA, async({ username, roomCode, sessionToken, dr, gr, im, zv, pl, rk, pr }) => {
        const v: boolean = await receiveDataValidator(io, socket, username, roomCode, sessionToken)
        if (v) receiveData(io, socket, username, roomCode, { dr, gr, im, zv, pl, rk, pr })
    })
    socket.on('test', () => {
        socket.emit('test')
    })

}

export const registerDisconnect = async(io: Server, socket: Socket) => {
    socket.on('disconnect', async() => {
        await GameData.unTrackSocket(io, socket)
    })
}