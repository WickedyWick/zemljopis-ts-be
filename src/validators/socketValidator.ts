import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
import { UsernameRegEx, RoomCodeRegEx, SessionTokenRegEx} from 'utils/strings'
import { GameData } from 'redisDb/game'

/**
 * Validator called when joinRoom request is sent
 * @param  {Server} io
 * @param  {Socket} socket
 * @param  {string} username
 * @param  {string} roomCode
 * @param  {string} sessionToken
 */
export const joinRoomValidator = async(
        io: Server,
        socket: Socket,
        username: string,
        roomCode: string,
        sessionToken: string
) => {
    try {
        const exists = await GameData.roomExists(roomCode)
        if (exists == 0) {
            socket.emit(EVENTS.JOIN_ROOM, {
                MSG: "Soba ne postoji",
                CODE: 404
            })
            return false
        }

        const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
        if (!s) {
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
/**
 * Validator called when playerReady request is sent
 * @param  {Server} io
 * @param  {Socket} socket
 * @param  {string} username
 * @param  {string} roomCode
 * @param  {string} sessionToken
 */
export const playerReadyValidator = async(
        io: Server,
        socket: Socket,
        username: string,
        roomCode: string,
        sessionToken: string
) => {
    try {
        const exists = await GameData.roomExists(roomCode)
        if (exists == 0) {
            socket.emit(EVENTS.PLAYER_READY, {
                MSG: "Soba ne postoji",
                CODE: 404
            })
            return false
        }

        const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
        if (!s) {
            socket.emit(EVENTS.PLAYER_READY, {
                MSG: "Parametri nisu validni",
                CODE: 400
            })
            return false
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
        console.log(`Error : ${e}`)
        socket.emit(EVENTS.PLAYER_READY, {
            MSG: 'Doslo je do problema.',
            CODE: 500
        })
        return false
    }
}

/**
 * Validator called when playerUnReady request is sent
 * @param  {Server} io
 * @param  {Socket} socket
 * @param  {string} username
 * @param  {string} roomCode
 * @param  {string} sessionToken
 */
export const playerUnReadyValidator = async(
    io: Server,
    socket: Socket,
    username: string,
    roomCode: string,
    sessionToken: string
) => {
    try {
        const exists = await GameData.roomExists(roomCode)
        if (exists == 0) {
            socket.emit(EVENTS.PLAYER_UNREADY, {
                MSG: "Soba ne postoji",
                CODE: 404
            })
            return false
        }

        const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
        if (!s) {
            socket.emit(EVENTS.PLAYER_UNREADY, {
                MSG: "Parametri nisu validni",
                CODE: 400
            })
            return false
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
        return false
    }
}
/**
 * Validator called when recieveData request is sent
 * @param  {Server} io
 * @param  {Socket} socket
 * @param  {string} username
 * @param  {string} roomCode
 * @param  {string} sessionToken
 */
export const receiveDataValidator = async(
    io: Server,
    socket: Socket,
    username: string,
    roomCode: string,
    sessionToken: string,
    forced: boolean
) => {
    try {
        const roomExists = await GameData.roomExists(roomCode)
        if (roomExists == 0) {
            socket.emit(EVENTS.RECEIVE_DATA, {
                MSG: "Soba ne postoji",
                CODE: 404
            })
            return false
        }

        // this basically checks if player exisst as well
        const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
        if (!s) {
            socket.emit(EVENTS.RECEIVE_DATA, {
                MSG: "Parametri nisu validni",
                CODE: 400
            })
            return false
        }
        const roomReg = await new RegExp(RoomCodeRegEx,'g').test(roomCode)
        const usernameReg = await new RegExp(UsernameRegEx,'g').test(username)
        const tokenReg = await new RegExp(SessionTokenRegEx,'g').test(sessionToken)
        if(roomReg && usernameReg && tokenReg) return true

        socket.emit(EVENTS.RECEIVE_DATA, {
            MSG: "Parametri nisu validni",
            CODE: 400
        })
        return false
    } catch(e) {
        console.error(`Error : ${e}`)
        socket.emit(EVENTS.RECEIVE_DATA, {
            MSG: 'Doslo je do problema.',
            CODE: 500
        })
        return false
    }
}