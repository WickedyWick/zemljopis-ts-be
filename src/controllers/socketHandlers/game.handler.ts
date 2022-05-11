import { Server, Socket } from 'socket.io'
import { GameData } from 'redis/game'
import { EVENTS } from 'sockets/game.sockets'
import { Player } from 'database/models'
export const joinRoom = async(io: Server, socket: Socket, username: string, roomCode: string) => {
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
        const p = await room.playerExists(username)
        if (!p) {
            socket.emit(EVENTS.JOIN_ROOM, {
                MSG: 'Igrac nije registrovan',
                CODE: 404
            })
            return
        }
        const data = await room.retrieveJoinRoomData(username)
        await socket.join(roomCode)
        socket.emit(EVENTS.JOIN_ROOM, {
            ...data
        })
        socket.to(roomCode).emit(EVENTS.PLAYER_JOINED, {
            username,
            points: data.points
        })
    }
}

export const playerReady = async(io: Server, socket: Socket, username: string, roomCode: string) => {
    const res = await GameData.playerReady(roomCode, username)
    if (!res) {
        socket.emit(EVENTS.PLAYER_READY, {
            CODE: 500
        })
        return
    }

    io.to(roomCode).emit(EVENTS.PLAYER_READY, {
        username
    })
}
export const playerUnReady = async(io: Server, socket: Socket, username: string, roomCode: string) => {
    const res = await GameData.playerUnReady(roomCode, username)
    if (!res) {
        socket.emit(EVENTS.PLAYER_UNREADY, {
            CODE: 500
        })
        return
    }
    io.to(roomCode).emit(EVENTS.PLAYER_UNREADY, {
        username
    })
}