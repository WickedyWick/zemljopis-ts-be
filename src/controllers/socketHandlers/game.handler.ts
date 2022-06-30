import { Server, Socket } from 'socket.io'
import { GameData } from 'redis/game'
import { EVENTS } from 'sockets/game.sockets'
import { Player, Round } from 'database/models'
import { chooseLetter } from 'utils/strings'

export const joinRoom = async(io: Server, socket: Socket, username: string, roomCode: string) => {
    // maybe insta search for player and then return somehting like wrong player and room combo
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
    await room.trackSocket(socket.id, username, roomCode)
    socket.emit('joinRoom', {
        ...data
    })
    socket.to(roomCode).emit(EVENTS.PLAYER_JOINED, {
        username,
        points: data.points
    })
}

export const playerReady = async(io: Server, socket: Socket, username: string, roomCode: string) => {
    try {
        const gameInProgress = await GameData.checkGameState(roomCode)
        if (gameInProgress == 1) {
            socket.emit(EVENTS.PLAYER_READY, {
                CODE: 500
            })
            return
        }

        const res = await GameData.playerReady(io, roomCode, username)
            io.to(roomCode).emit(EVENTS.PLAYER_READY, {
                username,
                ...res
            })
    } catch(e) {
        console.error(`Doslo je do problema prilikom slanja ready upa. SocketID: ${socket.id}\nERR: ${e}`)
    }
}

export const playerUnReady = async(io: Server, socket: Socket, username: string, roomCode: string) => {
    try {
        const gameInProgress = await GameData.checkGameState(roomCode)
        const res = await GameData.playerUnReady(roomCode, username)
        if (gameInProgress == 1) {
            socket.emit(EVENTS.PLAYER_UNREADY, {
                CODE: 500
            })
            return
        }

        io.to(roomCode).emit(EVENTS.PLAYER_UNREADY, {
            username,
            ...res
        })
    } catch(e) {
        console.error(`Doslo je do problema prilikom slanja unready upa. SocketID: ${socket.id}\nERR : ${e}`)
    }
}

export const gameStart = async(io: Server, room: string) => {
    try {
        // Create a round and send a signal update game in progress
        const gameData = new GameData(room)
        let letter = await chooseLetter(room)
        const roundNumber = await gameData.nextRound()
        const round = Round.create({
            room_code: room,
            letter,
            round_number: roundNumber,

        })
        await gameData.setGameInProgress(1)
        // Add to the index

        io.to(room).emit(EVENTS.GAME_START, ({
            letter,
            roundNumber
        }))
    } catch(e) {
         // log and eit error 
    }
}