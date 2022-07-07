import { redisDb } from './index'
import { defaultLetters } from 'utils/strings'
import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
import { gameStart } from 'controllers/socketHandlers/game.handler'
import { stringify } from 'querystring'
import internal from 'stream'

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
    roundIds: any,
    players: any,
    playersIds: any,
    availableLetters: string,
    currentLetter: string,
    evalFuncExecuting: number,
    data: any, // strongtype this later
    created_at: Date | string // not nessesarry in redis?
    active: boolean
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

    static createRoom = async(room: string,username: string, playerCount: number, roundTimeLimit: number) => {
        const value: GameFields = {
            playerCount,
            playersReady: 0,
            numOfDataReceived: 0,
            roundNumber: 0,
            roundTimeLimit,
            roundActive: 0,
            roundId: -1,
            roundIds: {},
            players: [],
            playersIds: {},
            availableLetters: defaultLetters,
            currentLetter: '',
            evalFuncExecuting: 0,
            data: {},
            created_at: new Date(),
            active: true,
            playersRegistered: 1,
            gameInProgress: 0,
        }
        //@ts-ignore
        await redisDb.hSet(room, value)
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
                        gameStart(io, room)
                    }
                }
                else {
                    throw Error
                }
            }

            return {
                CODE: 200,
                playersReady: pReady
            }

        } catch(e) {
            await this.unReadyAll(room)
            await redisDb.hSet(room, 'playersReady', 0)
            console.error(`Error during player ready up. Username|room: ${username}|${room}\nERR: ${e}`)
            return {
                CODE: 500,
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
        return await redisDb.hGetAll(this._room)
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
            const receivedData = await this.checkIfDataIsReceived(username)
            if (receivedData == 1) return { success: true, eval: false }
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
    givePointsToData = async(data: Map<string, string[]>, letter: string) => {
        const pointedData: Map<string, number> = new Map<string, number>()
        // if collection would be bigger i could have nonExist Map for rejected values
        for ( const [key, val] of data.entries()) {
            for (let i = 0; i < val.length; i++) {
                // @ts-ignore
                const exists = await redisDb.hExists(`${FieldIndex[i]}_${letter}`, val[i])
                if (!exists) continue
                if (!pointedData.has(val[i]))
                    pointedData.set(val[i], 20)
                else
                    pointedData.set(val[i], 10)
            }
        }
        return pointedData
    }

    prepReceiveData = async() => {
        return redisDb.hmGet(this._room, ['playerCount', 'roundId'])
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
            await redisDb.del(socket.id)
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
    getRoundId = async(room: string) => {
        return await redisDb.hGet(room, 'roundId')
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
        const expiresAt = new Date().getTime() + delay; // 60000 is one minute in ms
        console.log(expiresAt)
        return await redisDb.hSet(`round:timer:${roundId}`, {
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
        return await redisDb.del(`round:timer:${roundId}`)
    }
    deleteRoundTimer = async(roundId: number) => {
        return await redisDb.del(`round:timer:${roundId}`)
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

