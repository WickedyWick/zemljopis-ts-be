import { Server, Socket } from 'socket.io'
import { GameData } from 'redis/game'
import { EVENTS } from 'sockets/game.sockets'
export const joinRoom = async(io: Server, socket: Socket, username: string, roomCode: string, sessionToken: string) => {
    // maybe insta search for player and then return somehting like wrong player and room combo
    if (!await GameData.roomExists(roomCode)){
        socket.emit(EVENTS.JOIN_ROOM, {
            MSG: 'Soba ne postoji',
            CODE: 404
        })
    } else  {
        const room = new GameData(roomCode)
        if (!await room.playerExists(username)) {
            socket.emit(EVENTS.JOIN_ROOM, {
                MSG: 'Igrac nije registrovan',
                CODE: 404
            })
        } else {
            socket.emit(EVENTS.JOIN_ROOM, {
                CODE: 200
            })
        }
    }

}