import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
import { UsernameRegEx, RoomCodeRegEx, SessionTokenRegEx} from 'utils/strings'
import { GameData } from 'redisDb/game'
export const joinRoomValidator = async(
        io: Server,
        socket: Socket,
        username: string,
        roomCode: string,
        sessionToken: string) => {
    try {
        const exists = await GameData.roomExists(roomCode)
        if (exists == 0) {
            socket.emit(EVENTS.JOIN_ROOM, {
                MSG: "Soba ne postoji",
                CODE: 404
            })
        }

        const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
        if (!s) {
            console.log('par')
            socket.emit(EVENTS.JOIN_ROOM, {
                MSG: "Parametri nisu validni",
                CODE: 400
            })
            return false
        }

        const roomReg = await new RegExp(RoomCodeRegEx,'g').test(roomCode)
        const usernameReg = await new RegExp(UsernameRegEx,'g').test(username)
        const tokenReg = await new RegExp(SessionTokenRegEx,'g').test(sessionToken)
        if(roomReg && usernameReg && tokenReg) return true
        // return socket msg not false 
        console.log(roomReg, usernameReg, tokenReg)
        socket.emit(EVENTS.JOIN_ROOM, {
            MSG: "Parametri nisu validni",
            CODE: 400
        })
        return false
    } catch(e) {
        console.log(e)
        socket.emit(EVENTS.JOIN_ROOM, {
            MSG: 'Doslo je do problema.',
            CODE: 500
        })
        return false
    }
}

export const playerReadyValidator = async(
        io: Server,
        socket: Socket,
        username: string,
        roomCode: string,
        sessionToken: string) => {
    try {
        const exists = await GameData.roomExists(roomCode)
        if (exists == 0) {
            socket.emit(EVENTS.PLAYER_READY, {
                MSG: "Soba ne postoji",
                CODE: 404
            })
        }

        const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
        if (!s) {
            socket.emit(EVENTS.PLAYER_READY, {
                MSG: "Parametri nisu validni",
                CODE: 400
            })
        }
        const roomReg = await new RegExp(RoomCodeRegEx,'g').test(roomCode)
        const usernameReg = await new RegExp(UsernameRegEx,'g').test(username)
        const tokenReg = await new RegExp(SessionTokenRegEx,'g').test(sessionToken)
        if(roomReg && usernameReg && tokenReg) return true

        socket.emit(EVENTS.PLAYER_READY, {
            MSG: "Parametri nisu validni",
            CODE: 400
        })
        return false
    } catch(e) {
        socket.emit(EVENTS.PLAYER_READY, {
            MSG: 'Doslo je do problema.',
            CODE: 500
        })
    }
}

export const playerUnReadyValidator = async(
    io: Server,
    socket: Socket,
    username: string,
    roomCode: string,
    sessionToken: string) => {
try {
    const exists = await GameData.roomExists(roomCode)
    if (exists == 0) {
        socket.emit(EVENTS.PLAYER_UNREADY, {
            MSG: "Soba ne postoji",
            CODE: 404
        })
    }

    const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
    if (!s) {
        socket.emit(EVENTS.PLAYER_UNREADY, {
            MSG: "Parametri nisu validni",
            CODE: 400
        })
    }
    const roomReg = await new RegExp(RoomCodeRegEx,'g').test(roomCode)
    const usernameReg = await new RegExp(UsernameRegEx,'g').test(username)
    const tokenReg = await new RegExp(SessionTokenRegEx,'g').test(sessionToken)
    if(roomReg && usernameReg && tokenReg) return true

    socket.emit(EVENTS.PLAYER_UNREADY, {
        MSG: "Parametri nisu validni",
        CODE: 400
    })
    return false
} catch(e) {
    socket.emit(EVENTS.PLAYER_UNREADY, {
        MSG: 'Doslo je do problema.',
        CODE: 500
    })
}
}