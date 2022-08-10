import { Server, Socket } from 'socket.io'
import { GameData, ReceivedData } from 'redisDb/game'
import { EVENTS } from 'sockets/game.sockets'
import { Player, Round, Result } from 'database/models'
import { chooseLetter } from 'utils/strings'
import { PlayerIdsInterface } from 'database/models/round'
import { IO } from 'index'
import { logError } from 'utils/logger'
import { redisDb, serveTransactionClient } from 'redisDb'
import { transactionClient } from 'redisDb/transactionClient'

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
    socket.emit(EVENTS.JOIN_ROOM, {
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
        const transactionClient = await serveTransactionClient(roomCode)
        const res = await transactionClient.playerReady(username)
        io.to(roomCode).emit(EVENTS.PLAYER_READY, {
            username,
            ...res
        })
        if (res.gameStart) {
            await gameStart(io, roomCode)
        }
    } catch(e) {
        io.to(roomCode).emit(EVENTS.PLAYER_READY, {
            CODE: 500
        })
        await logError(`Error during ready upa. SocketID: ${ socket.id }`, e)
    }
}

export const playerUnReady = async(io: Server, socket: Socket, username: string, roomCode: string) => {
    try {
        const gameInProgress = await GameData.checkGameState(roomCode)
        const transactionClient = await serveTransactionClient(roomCode)
        const res = await transactionClient.playerUnReady(username)
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
        io.to(roomCode).emit(EVENTS.PLAYER_UNREADY, {
            CODE: 500
        })
        await logError(`Error during un-ready up. SocketID: ${ socket.id }`, e)
    }
}

export const gameStart = async(io: Server, room: string) => {
    const gameData = new GameData(room)
    try {
        // Create a round and send a signal update game in progress
        let letter = await chooseLetter(room)
        letter = 'KRAJ IGRE'
        if (letter == 'KRAJ IGRE') {
            io.to(room).emit(EVENTS.GAME_START, ({
                letter,
                roundNumber: -1
            }))
            return await gameData.closeRoom()
            
        }
        const roundNumber = await gameData.nextRound()

        const round = await Round.create({
            room_code: room,
            letter,
            round_number: roundNumber,
        })

        await gameData.setGameInProgressAndRoundId(1, round.id)
        // Add to the index
        const roundTimeLimit: number = await gameData.getRoundTimeLimit(room)
        // + 1500 is buffered time for data to come back from the client if client has bad itnernet
        // if in that period data isnt't recieve there i extra 3s ? not sure if this is nessary
        // and after that eval method exectuion will definitely happen
        await gameData.addRoundTimer(round.id, 'endRound', roundTimeLimit * 1000)
        io.to(room).emit(EVENTS.GAME_START, ({
            letter,
            roundNumber
        }))
        const playerIds = await gameData.getPlayerIds()
        await round.createEmptyResults(playerIds)
    } catch(e) {
        await logError(`Error during game start.`, e)
        await gameData.rollBackGameStart()
    }
}

export const receiveData = async(io: Server, socket: Socket, username: string, room: string, data: ReceivedData) => {
    try {
        const gameData = await new GameData(room)
        const prepData = await gameData.prepReceiveData(username)
        const result = await Result.findBy({ round_id: Number(prepData[1]), player_id: Number(prepData[2]) })
        // if this fails it will return 500
        await result.update({
            drzava: data.dr,
            grad: data.gr,
            ime: data.im,
            biljka: data.bl,
            zivotinja: data.zv,
            planina: data.pl,
            reka: data.rk,
            predmet: data.pr
        })

        const res = await gameData.receiveData(username, Number(prepData[1]), Number(prepData[0]), data)
        if (res.success) {
            socket.emit(EVENTS.RECEIVE_DATA, {
                CODE: 200
            })
            if (!res.eval) return
        }

        // evaluate
        await evaluate(room)
    } catch(e) {
        console.log(`${ new Date().toLocaleString() } Error during receiving data. ERR : ${ e }`)
        socket.emit(EVENTS.RECEIVE_DATA, {
            CODE: 500
        })
    }
}

export const evaluate = async(room: string) => {
    try {
        console.time('timeEvaluation')
        const gameData = new GameData(room)
        const letter = await gameData.getLetter()
        const playerNameId: PlayerIdsInterface = await gameData.getPlayerIds()
        const playerNames: string[] = []
        const playerIds: number[] = []
    
        for ( const [key, value] of Object.entries(playerNameId)) {
            playerNames.push(key)
            playerIds.push(Number(value))
        }
        const playerFieldData: Map<string, string[]> = await gameData.getPlayerFieldData(playerNames)
        const pointedData: Map<string, number> = await gameData.setPointsToData(playerFieldData, letter)
        const results = await Object.fromEntries(pointedData)
        results['CODE'] = 200
        IO.to(room).emit(EVENTS.RESULT, results)
        await gameData.setPointsToField(playerFieldData, pointedData, playerNameId)
        await gameData.resetRoomFieldsData(0)
        console.timeEnd('timeEvaluation')
    } catch(e) {
        console.error(`${ new Date().toLocaleDateString() }`)
        IO.to(room).emit(EVENTS.RESULT, {
            CODE: 500
        })
    }
    
}

