import { Server, Socket } from "socket.io";
import { joinRoomValidator, playerReadyValidator, playerUnReadyValidator, receiveDataValidator, wordSuggestionValidator } from "validators/socketValidator";
import { joinRoom, playerReady, playerUnReady, receiveData, wordSuggestion } from "controllers/socketHandlers/game.handler";
import { GameData } from "redisDb/game";
export const EVENTS = {
    JOIN_ROOM : 'joinRoom',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_READY: 'playerReady',
    PLAYER_UNREADY: 'playerUnReady',
    RECEIVE_DATA: 'receiveData',
    GAME_START: 'gameStart',
    RESULT: 'result',
    FORCE_GAME_END: 'forceGameEnd',
    WORD_SUGGESTION: 'wordSuggestion'
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

    socket.on(EVENTS.RECEIVE_DATA, async({username, roomCode, sessionToken, dr, gr, im, bl, zv, pl, rk, pr, forced }) => {
        const v: boolean = await receiveDataValidator(io, socket, username, roomCode, sessionToken, forced)
        if (v) receiveData(io, socket, username, roomCode, { dr: dr, gr: gr, im: im, bl:bl, zv: zv, pl: pl, rk: rk, pr: pr }, forced)
    })

    socket.on(EVENTS.WORD_SUGGESTION, async({ username, roomCode, sessionToken , word, category, currentLetter }) => {
        const v: boolean = await wordSuggestionValidator(io, socket, username, roomCode, sessionToken, word, category, currentLetter)
        if (v) wordSuggestion(io, socket, word, category, currentLetter)
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