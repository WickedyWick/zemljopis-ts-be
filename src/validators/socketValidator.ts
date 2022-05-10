import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
import { UsernameRegEx, RoomCodeRegEx, SessionTokenRegEx} from 'utils/strings'
export const joinRoomValidator = async(
        io: Server,
        socket: Socket,
        username: string,
        roomCode: string,
        sessionToken: string) => {
    try {
        const roomReg = await new RegExp(RoomCodeRegEx,'g').test(roomCode)
        const usernameReg = await new RegExp(UsernameRegEx,'g').test(username)
        const tokenReg = await new RegExp(SessionTokenRegEx,'g').test(sessionToken)
        if(roomReg && usernameReg && tokenReg) return true
        return false
    } catch(e) {
        socket.emit(EVENTS.JOIN_ROOM, {
            MSG: 'Doslo je do problema.',
            CODE: 500
        })
        return false
    }
}