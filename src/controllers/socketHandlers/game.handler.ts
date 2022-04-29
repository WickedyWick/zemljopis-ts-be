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
        // Perhaps wrap validation fucntions in one function and one redis calls instead of 3
        // but due to relativly low amout of requests this will work in this case as well since redis is really fast
        // if this is making problems wrap functions in 1 and do 1 db call
        console.log(sessionToken)
        if (!await room.playerExists(username) && !await room.checkSessionToken(username, sessionToken)) {
            socket.emit(EVENTS.JOIN_ROOM, {
                MSG: 'Igrac nije registrovan',
                CODE: 404
            })
        } else {
            const data = await room.retrieveJoinRoomData(username)
            socket.emit(EVENTS.JOIN_ROOM, {
                ...data
            })
        }
    }

}