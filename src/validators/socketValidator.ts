import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
import { UsernameRegEx, RoomCodeRegEx, SessionTokenRegEx} from 'utils/strings'
import { GameData } from 'redisDb/game'
import { CategoriesSet } from 'utils/consts'
import { logError } from 'utils/logger'
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
        await logError(`Error during player join validator`, e)
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
        await logError(`Error during player ready validator`, e)
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
        await logError(`Error during player un ready validator`, e)
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
        await logError(`Error during recieve data validator`, e)
        socket.emit(EVENTS.RECEIVE_DATA, {
            MSG: 'Doslo je do problema.',
            CODE: 500
        })
        return false
    }
}

export const wordSuggestionValidator = async(
    io: Server,
    socket: Socket,
    username: string,
    roomCode: string,
    sessionToken: string,
    word: string,
    category: number
) => {
    try {
        if (!CategoriesSet.has(category)) {
            socket.emit(EVENTS.WORD_SUGGESTION, {
                MSG: 'Parametri nisu validni',
                category,
                CODE: 400
            })
            return 
        }

        const roomExists = await GameData.roomExists(roomCode)
        if (roomExists == 0) {
            socket.emit(EVENTS.WORD_SUGGESTION, {
                MSG: "Soba ne postoji",
                category,
                CODE: 404
            })
            return false
        }

        // this basically checks if player exisst as well
        const s = await GameData.checkSessionToken(roomCode, username, sessionToken)
        if (!s) {
            socket.emit(EVENTS.WORD_SUGGESTION, {
                MSG: "Parametri nisu validni",
                category,
                CODE: 400
            })
            return false
        }
        const roomReg = await new RegExp(RoomCodeRegEx,'g').test(roomCode)
        const usernameReg = await new RegExp(UsernameRegEx,'g').test(username)
        const tokenReg = await new RegExp(SessionTokenRegEx,'g').test(sessionToken)
        if(roomReg && usernameReg && tokenReg) return true

        socket.emit(EVENTS.WORD_SUGGESTION, {
            MSG: "Parametri nisu validni",
            category,
            CODE: 400
        })

        return false
    } catch(e) {
        await logError(`Error during validation of word suggesiton` , e)
        socket.emit(EVENTS.WORD_SUGGESTION, {
            MSG: 'Doslo je do problema.',
            category,
            CODE: 500
        })
    }
    
}