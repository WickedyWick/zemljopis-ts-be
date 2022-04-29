import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
export const joinRoomValidator = async(
        io: Server,
        socket: Socket,
        username: string,
        roomCode: string,
        sessionToken: string) => {
    try {
        const roomReg = await new RegExp('^[A-Za-z0-9]{8}$','g').test(roomCode)
        const usernameReg = await new RegExp('^[A-Za-z0-9а-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$','g').test(username)
        const tokenReg = await new RegExp('^[A-Za-z0-9]{96}$','g').test(sessionToken)
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