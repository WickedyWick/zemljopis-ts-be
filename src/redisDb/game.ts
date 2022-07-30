import { redisDb } from './index'
import { defaultLetters } from 'utils/strings'
import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
import { gameStart } from 'controllers/socketHandlers/game.handler'
import { Result } from 'database/models'
import player from 'database/models/player'
import { PlayerIdsInterface } from 'database/models/round'

export const FieldIndex = {
    0: 'drzava',
    1: 'grad',
    2: 'ime',
    3: 'biljka',
    4: 'zivotinja',
    5: 'planina',
    6: 'reka',
    7: 'predmet'
}

export const PointFieldIndex = {
    0: 'points_dr',
    1: 'points_gr',
    2: 'points_im',
    3: 'points_bl',
    4: 'points_zv',
    5: 'points_pl',
    6: 'points_rk',
    7: 'points_pr'
}
export interface ReceivedData {
    dr: string
    gr: string,
    im: string,
    bl: string,
    zv: string,
    pl: string,
    rk: string,
    pr: string
}
export interface GameFields {
    playerCount: number,
    playersReady: number,
    numOfDataReceived: number,
    roundNumber: number,
    roundTimeLimit: number,
    roundActive: number,
    roundId: number | null,
    availableLetters: string,
    currentLetter: string,
    evalFuncExecuting: number,
    created_at: Date | string // not nessesarry in redis?
    active: number
    playersRegistered: number
    gameInProgress: number
}

export interface PlayerValues {
    id: number,
    points: number,
    sessionToken: string,
    ready: number
    dr: string,
    gr: string,
    im: string,
    bl: string,
    zv: string,
    pl: string,
    rk: string,
    pr: string,
    dataReceived: number
}
interface SearchValueFields {
    roundId: number,
    room: string,
    expiresAt: number
}
 //pogledaj value ts

export class GameData {
    private _room: string

    constructor (name: string) {
        this._room = name
    }
    static roomExists = async(room: string) => {
        return await redisDb.exists(room)
    }

    static createRoom = async(room: string, username: string, playerCount: number, roundTimeLimit: number) => {
        const value: GameFields = {
            playerCount,
            playersReady: 0,
            numOfDataReceived: 0,
            roundNumber: 0,
            roundTimeLimit,
            roundActive: 0,
            roundId: -1,
            availableLetters: defaultLetters,
            currentLetter: '',
            evalFuncExecuting: 0,
            created_at: new Date().toLocaleDateString(),
            active: 1,
            playersRegistered: 1,
            gameInProgress: 0,
        }
        console.log(value)
        //@ts-ignore
        await redisDb.hSet(room, value)
        console.log('log2')
        // 12h
        //await redisDb.expireAt(room, 43200)

        return new this(room)
    }

    static createPlayer = async(room: string, username: string, id: number, sessionToken: string) => {
        await redisDb.hSet(`players_${room}`, { [username]: id})
        const value: PlayerValues = {
            id: id,
            points: 0,
            sessionToken: sessionToken,
            ready: 0,
            dr: '',
            gr: '',
            im: '',
            bl: '',
            zv: '',
            pl: '',
            rk: '',
            pr: '',
            dataReceived: 0
        }

        // @ts-ignore
        await redisDb.hSet(`${username}_${room}`, value)
    }

    static createRounds = async(room: string, roundNumber: number, id: number) => {
        await redisDb.hSet(`rounds_${room}`, { [roundNumber]: id })
    }
    static checkSessionToken = async(room: string, username: string, sessionToken: string) => {
        const sT = await redisDb.hGet(`${username}_${room}`, 'sessionToken')
        return sT === sessionToken
    }
    static playerReady = async(io: Server, room: string, username: string) => {
        try {
            const ready = await redisDb.hGet(`${username}_${room}`, 'ready')
            let pReady = -1
            if(ready == '0') {
                const data = await redisDb.hmGet(room, ['playersReady', 'playerCount'])
                await redisDb.hSet(`${username}_${room}`, 'ready', 1)
                const updated = Number(data[0]) + 1
                if (updated <= Number(data[1]) && Number(data[0]) >= 0) {
                    pReady = await redisDb.hIncrBy(room, 'playersReady', 1)
                    if (pReady == Number(data[1])) {
                        return {
                            CODE: 200,
                            gameStart: true,
                            playersReady: pReady
                        }
                    }
                }
                else {
                    await this.unReadyAll(room)
                    await redisDb.hSet(room, 'playersReady', 0)
                    console.error(`${new Date()}: Error during player ready up. Username|room: ${username}|${room}\nERR: values out of range`)
                    return {
                        CODE: 500,
                        gameStart: false,
                        playersReady: 0
                    }
                }
            }

            return {
                CODE: 200,
                gameStart: false,
                playersReady: pReady
            }

        } catch(e) {
            await this.unReadyAll(room)
            await redisDb.hSet(room, 'playersReady', 0)
            console.error(`${new Date('')}: Error during player ready up. Username|room: ${username}|${room}\nERR: ${e}`)
            return {
                CODE: 500,
                gameStart: false,
                playersReady: 0
            }
        }
    }
    static playerUnReady = async(room: string, username: string) => {
        try {
            const ready = await redisDb.hGet(`${username}_${room}`, 'ready')
            let pReady = -1
            if ( ready == '1') {
                const data = await redisDb.hmGet(room, ['playersReady', 'playerCount'])
                await redisDb.hSet(`${username}_${room}`, 'ready', 0)
                const updated = Number(data[0]) - 1
                if (updated >= 0 && Number(data[0]) <= Number(data[1]))
                    pReady = await redisDb.hIncrBy(room, 'playersReady', - 1)
                else
                    throw Error
            }
            return {
                CODE: 200,
                playersReady: pReady
            }
        } catch(e) {
            // need to set all to 0
            await this.unReadyAll(room)
            await redisDb.hSet(room, 'playersReady', 0)
            console.error(`Error during player unready up. Username|room: ${username}|${room}\nERR: ${e}`)
            return {
                CODE: 500,
                playersReady: 0
            }
        }
    }
    getPlayerIds = async() => {
        return await redisDb.hGetAll(`players_${this._room}`)
    }
    trackSocket = async(socketId: string, username: string, room: string) => {
        try {
            await redisDb.hSet(socketId, { username: username, room: room })
        } catch (e) {
            console.error(`Error tracking socket. Username: ${ username }\nSocketID: ${ socketId }\nErr : ${e}`)
        }
    }
    receiveData = async(username: string, roundId: number, playerCount: number, data: ReceivedData) => {
        try {

            // TODO 
            // have recieveddata set at one and use HSETEX and del when you want to 0 it
            const receivedData = await this.checkIfDataIsReceived(username)
            if (receivedData == 1) return { success: true, eval: false }
            console.log('DATAAAAA', data)
            // @ts-ignore
            await redisDb.hSet(`${ username }_${this._room}`, data)
            const numOfReceivedData = await redisDb.hIncrBy(this._room, 'numOfDataReceived', 1)
            if (playerCount == numOfReceivedData) {
                await this.deleteRoundTimer(roundId)
                return {
                    success: true,
                    eval: true,
                }
            }
            return {
                success: true,
                eval: false
            }
        } catch(e) {
            console.error(`There was an error during receiving data. Err : ${ e }.`)
            return {
                success: false,
                eval: false,
            }
        }
    }

    getPlayerFieldData = async(playerNames: string[]) => {
        /*
            Returns players guessed data and formats it for evaluation
        */
        const map: Map<string, string[]> = new Map<string, string[]>()
        for ( let i =0; i < playerNames.length; i++) {
            const data = await redisDb.hmGet(`${playerNames[i]}_${this._room}`, ['dr','gr','im', 'bl', 'zv', 'pl', 'rk', 'pr'])
            console.log('DATA', data)
            await map.set(playerNames[i], data)
        }
        /*
        * player: ['dr','gr','im', 'bl', 'zv', 'pl', 'rk', 'pr']
        */
        return map
    }
    getLetter = async() => {
        return await redisDb.hGet(this._room, 'letter')
    }
    setPointsToData = async(playerData: Map<string, string[]>, letter: string) => {
        const pointedData: Map<string, number> = new Map<string, number>()
        const nonExistData: Map<string, number> = new Map<string, number>()
        // if collection would be bigger i could have nonExist Map for rejected values
        // rename this data to data_cat so you dont ahve to tru each but just tru smaller dictionary size
        for ( const [key, val] of playerData.entries()) {
            for (let i = 0; i < val.length; i++) {
                if(nonExistData.has(`${val[i]}_${i}`))
                    continue
                console.log(val)
                console.log(val[i])
                // @ts-ignore
                const exists = await redisDb.hExists(`${FieldIndex[i]}_${letter}`, val[i])
                if (!exists) {
                    pointedData.set(`${val[i]}_${i}`, 0)
                    nonExistData.set(`${val[i]}_${i}`, 1)
                    continue
                }
                // val_cat(index) so its easier to set field points for db
                if (!pointedData.has(`${val[i]}_${i}`))
                    pointedData.set(`${val[i]}_${i}`, 20)
                else
                    pointedData.set(`${val[i]}_${i}`, 10)
            }
        }
        // console.log('RESULTS1') 
        // pointedData.forEach((key, val) => {
        //     console.log(key, val)
        // })
        return pointedData
    }
    setPointsToField = async(playerFieldData: Map<string, string[]>, pointedData: Map<string, number>, playerData: PlayerIdsInterface) => {
        try {
            // final
            const promiseArr:Promise<void>[] = []
            const roundId = await this.getRoundId()
            // key is playername and val is arr of his fields
            for ( const [key, val] of playerFieldData.entries()) {
                // have another map for non good vals?
                const pointsData = {}
                let sum = 0

                for (let i =0 ; i < val.length; i++) {
                    let points = 0
                    if(val[i] != '') points = pointedData.get(`${val[i]}_${i}`)
                    // @ts-ignore
                    pointsData[PointFieldIndex[i]] = points
                    console.log(i)
                    sum += points
                }
                // maybe in separate function
                await redisDb.hSet(`${key}_${this._room}`, { 'ready' : 0, 'dataReceived': 0})
                if (sum == 0) continue
                promiseArr.push(this.updatePoints(key, sum))
                const pId = Number(playerData[key])
                // update player by id
                await Result.updateWhere(roundId, pId, pointsData)
            }
            await Promise.all(promiseArr).catch((e) => {
                console.log(e)
            })
        } catch(e) {
            console.log(`Error during setting points to field. Err: ${ e }`)
        }
    }

    updatePoints = async(username: string, value: number) => {
        try {
            await redisDb.hIncrBy(`${username}_${this._room}`, 'points', value)
        } catch(e) {
            console.log(`ERROR FOR UDPATE :${e}`)
        }
    }
    prepReceiveData = async(username: string) => {
        const data: string[] =  await redisDb.hmGet(this._room, ['playerCount', 'roundId'])
        const id = await redisDb.hGet(`${username}_${this._room}`, 'id')
        data.push(id)
        return data

    }
    checkIfDataIsReceived = async(username: string) => {
        return Number(await redisDb.hGet(`${ username }_${ this._room }`, 'receivedData'))
    }
    static unTrackSocket = async(io: Server, socket: Socket) => {
        try {
            const { username, room } = await redisDb.hGetAll(socket.id)
            const res = await this.playerUnReady(room, username)
            io.to(room).emit(EVENTS.PLAYER_UNREADY, {
                username,
                ...res
            })
            await redisDb.unlink(socket.id)
            await socket.leave(room)
        } catch(e) {
            console.error(`Error untracking socket. SocketID: ${ socket.id }\nErr : ${ e }`)
        }
    }

    static unReadyAll = async(room: string) => {
        const keys = await redisDb.hKeys(room)
        for (let i = 0 ; i < keys.length ; i++) {
            await redisDb.hSet(`${keys[i]}_${room}`, 'ready', 0)
        }
    }

    retrieveJoinRoomData = async(username: string, code?: 200) => {
        const res = await redisDb.hmGet(this._room, ['playersReady', 'playerCount', 'roundNumber', 'roundTimeLimit', 'roundActive'])
        const players = await redisDb.hKeys(`players_${this._room}`)
        const pointsAndReady = await redisDb.hmGet(`${username}_${this._room}`,['points', 'ready'])

        // code consistency ?
        return {
            code: 200,
            ...res,
            points: pointsAndReady[0],
            ready: pointsAndReady[1],
            players: players
        }
    }
    getRoundId = async() => {
        return Number(await redisDb.hGet(this._room, 'roundId'))
    }
    static checkGameState = async(room: string) => {
        return Number(await redisDb.hGet(room, 'gameInProgress'))
    }

    static getExpiredRoundTimers = async() => {
        // fetches expired game timers
        const date = new Date().getTime()
        /*
            {
                total: 1,
                documents: [ { id: 'round:timer:3', value: [Object: null prototype] } ]
            }
            value : {
                roundId,
                room,
                expiresAt
            }
        */
        return await redisDb.ft.search('round-timer-idx', `@expiresAt:[1000000000 ${date}]`)
    }
    setGameInProgress = async(state: number, roundId: number) => {
        await redisDb.hSet(this._room, 'gameInProgress', state)
        await redisDb.hSet(this._room, 'roundId', roundId)
    }
    // same as craete Player
    addPlayer = async(username: string, id: number, sessionToken: string ) => {
        // unique key
        await redisDb.hSet(`players_${this._room}`, { [username]: id})
        await redisDb.hSet(`${username}_${this._room}`, { id: id, points: 0, sessionToken: sessionToken, ready: 0 })
    }
    playerExists = async(username: string) => {
        return Number(await redisDb.exists(`${username}_${this._room}`))
    }

    getLetters = async() => {
        return redisDb.hGet(this._room, 'availableLetters')
    }
    setLetters = async(letters: string, currentLetter: string) => {
        await redisDb.hSet(this._room, 'currentLetter', currentLetter)
        return await redisDb.hSet(this._room, 'availableLetters', letters)
    }
    // combine getplayer ciount and players joined in one query with hmGet?
    getPlayerCount = async() => {
        return Number(await redisDb.hGet(this._room, 'playerCount'))
    }
    getPlayersJoined = async() => {
        return Number(await redisDb.hGet(this._room, 'playerRegistered'))
    }
    setHash = async(key: string, value: Partial<GameFields>) => {
        // @ts-ignore
        return await redisDb.hSet(key, value)
    }
    nextRound = async() => {
        return await redisDb.hIncrBy(this._room, 'roundNumber', 1)
    }
    addRoundTimer = async(roundId: number, mode: 'endRound' | 'force', delay: number) => {
        // adds unix timestamp to the index
       // const expiresAt = new Date().getTime() + delay + 3000; // 60000 is one minute in ms
       const expiresAt = new Date().getTime() + delay + 3000
        console.log(expiresAt)
        return await redisDb.hSet(`round:timer:${ roundId }`, {
            'roundId': roundId,
            'room': this._room,
            'expiresAt': expiresAt,
            'mode': mode
        })
    }
    getRoundTimeLimit = async(room: string) => {
        return Number(await redisDb.hGet(room, 'roundTimeLimit'))
    }
    static delRoundTimer = async(roundId: number) => {
        return await redisDb.unlink(`round:timer:${roundId}`)
    }
    deleteRoundTimer = async(roundId: number) => {
        return await redisDb.unlink(`round:timer:${roundId}`)
    }
    getHashByKey = async(setKey: string, valKey: string) => {
        return await redisDb.hGet(setKey, valKey)
    }

    getHashAll = async(setKey: string) => {
        return await redisDb.hGetAll(setKey)
    }

    updateHash = async(room: string, values: any ) => {
        if (await redisDb.exists(room)) {
            await redisDb.hSet(room, values)
            return true
        } else {
            return false
        }
    }

    hashExists = async(key: string) => {
        return await redisDb.exists(key)
    }

}

