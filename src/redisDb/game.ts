import { redisDb } from './index'
import { defaultLetters } from 'utils/strings'
import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'
import { gameStart } from 'controllers/socketHandlers/game.handler'
import { Result } from 'database/models'
import player from 'database/models/player'
import { PlayerIdsInterface } from 'database/models/round'
import { logError } from 'utils/logger'

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
    currentLetter: string,
    created_at: Date | string // not nessesarry in redis?
    active: number
    playersRegistered: number
    gameInProgress: number
}

export interface PlayerValues {
    id: number,
    points: number,
    sessionToken: string,
    ready?: number
    dr: string,
    gr: string,
    im: string,
    bl: string,
    zv: string,
    pl: string,
    rk: string,
    pr: string,
    dataReceived?: number
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
            currentLetter: '',
            created_at: new Date().toLocaleDateString(),
            active: 1,
            playersRegistered: 1,
            gameInProgress: 0,
        }
        //@ts-ignore
        await redisDb.hSet(room, value)
        await this.setDefaultLetters(room)
        // 12h
        //await redisDb.expireAt(room, 43200)

        return new this(room)
    }

    static createPlayer = async(room: string, username: string, id: number, sessionToken: string) => {
        await redisDb.hSet(`players:${room}`, { [username]: id})
        const value: PlayerValues = {
            id: id,
            points: 0,
            sessionToken: sessionToken,
            dr: '',
            gr: '',
            im: '',
            bl: '',
            zv: '',
            pl: '',
            rk: '',
            pr: '',
        }

        // @ts-ignore
        await redisDb.hSet(`${username}:${room}`, value)
    }

    static createRounds = async(room: string, roundNumber: number, id: number) => {
        await redisDb.hSet(`rounds:${room}`, { [roundNumber]: id })
    }
    static checkSessionToken = async(room: string, username: string, sessionToken: string) => {
        const sT = await redisDb.hGet(`${username}:${room}`, 'sessionToken')
        return sT === sessionToken
    }

    getPlayerIds = async() => {
        // TODO HSCAN
        return await redisDb.hGetAll(`players:${this._room}`)
    }
    getPlayerNames = async() => {
        // TODO HSCAN
        return await redisDb.hKeys(`players:${this._room}`)
    }
    trackSocket = async(socketId: string, username: string, room: string) => {
        try {
            await redisDb.hSet(socketId, { username: username, room: room })
        } catch (e) {
            console.error(`Error tracking socket. Username: ${ username }\nSocketID: ${ socketId }\nErr : ${e}`)
        }
    }

    setEvalStart = async() => {
        return await redisDb.hSetNX(this._room, 'evalInProgress', '1')
    }

    receiveData = async(username: string, roundId: number, playerCount: number, data: ReceivedData) => {
        try {

            // TODO 
            // have recieveddata set at one and use HSETEX and del when you want to 0 it
            const receivedData = await this.setDataIsReceived(username)
            // ignores it data is already recived
            if (!receivedData) return { success: true, eval: false }

            // @ts-ignore
            await redisDb.hSet(`${ username }:${this._room}`, data)
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
            const data = await redisDb.hmGet(`${playerNames[i]}:${this._room}`, ['dr','gr','im', 'bl', 'zv', 'pl', 'rk', 'pr'])
            await map.set(playerNames[i], data)
        }
        /*
        * player: ['dr','gr','im', 'bl', 'zv', 'pl', 'rk', 'pr']
        */
        return map
    }
    getLetter = async() => {
        return await redisDb.hGet(this._room, 'currentLetter')
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
                const exists = await redisDb.hExists(`${FieldIndex[i]}:${letter}`, val[i])
                // @ts-ignore
                console.log(`${val[i]} is ${exists} in ${FieldIndex[i]}:${letter}`)

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

                // reset player after game
                await this.resetPlayerAfterGame(key)
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

    /**
     * Resets player to default values after game is ready,
     * this needs to happen so player can receive data and ready up after each round
     * @param  {string} username - Username of player
     */
    resetPlayerAfterGame = async(username: string) => {
        await redisDb.hSet(`${username}:${this._room}`, {
            dr: '',
            gr: '',
            im: '',
            bl: '',
            zv: '',
            pl: '',
            rk: '',
            pr: '',
        })
        await redisDb.hDel(`${username}:${this._room}`, ['ready' , 'dataReceived'])
    }

    updatePoints = async(username: string, value: number) => {
        try {
            await redisDb.hIncrBy(`${username}:${this._room}`, 'points', value)
        } catch(e) {
            console.log(`ERROR FOR UDPATE :${e}`)
        }
    }
    prepReceiveData = async(username: string) => {
        const data: string[] =  await redisDb.hmGet(this._room, ['playerCount', 'roundId'])
        const id = await redisDb.hGet(`${username}:${this._room}`, 'id')
        data.push(id)
        return data

    }
    setDataIsReceived = async(username: string) => {
        return await redisDb.hSetNX(`${username}:${this._room}`, 'dataReceived', '1')
    }

    /**
     * This functions readys up a player and increments players ready on room key
     * @param  {Server} io - global io instance,  prob not nessary
     * @param  {string} room
     * @param  {string} username
     */
    static playerUnReadyDisconnect = async(room: string, username: string) => {
        try {
            let pReady  = -1
            const res = await redisDb.hDel(`${username}:${room}`, 'ready')
            
            if (res == 0) {
                return {
                    CODE: 200,
                    playersReady: pReady
                }
            }
            
            pReady = await redisDb.hIncrBy(room, 'playersReady', -1)
            return {
                CODE: 200,
                playersReady: pReady
            }
        } catch(e) {
            await logError(`Error during playerUnReadyDisconnect.`,e)
            return {
                CODE: 500,
                playersReady: -1
            }
        }
       


    }
    static unTrackSocket = async(io: Server, socket: Socket) => {
        try {
            const { username, room } = await redisDb.hGetAll(socket.id)
            if (!username || !room) return
            const res = await this.playerUnReadyDisconnect(room, username)
            io.to(room).emit(EVENTS.PLAYER_UNREADY, {
                username,
                ...res
            })
            await redisDb.unlink(socket.id)
            await socket.leave(room)
        } catch(e) {
            console.error(`Error untracking socket. SocketID: ${ socket.id }\nErr : ${ e }`)
            // handle this
        }
    }

    static unReadyAllS = async(room: string) => {
        const keys = await redisDb.hKeys(`players:${room}`)
        for (let i = 0 ; i < keys.length ; i++) {
            await redisDb.hSet(`${keys[i]}:${room}`, 'ready', 0)
        }
    }

    unReadyAll = async() => {
        const keys = await redisDb.hKeys(`players:${this._room}`)
        for (let i = 0 ; i < keys.length ; i++) {
            await redisDb.hSet(`${keys[i]}:${this._room}`, 'ready', 0)
        }
    }
    retrieveJoinRoomData = async(username: string, code?: 200) => {
        const res = await redisDb.hmGet(this._room, ['playersReady', 'playerCount', 'roundNumber', 'roundTimeLimit', 'gameInProgress'])
        const players = await redisDb.hKeys(`players:${this._room}`)
        const pointsAndReady = await redisDb.hmGet(`${username}:${this._room}`,['points', 'ready'])

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
    setGameInProgressAndRoundId = async(state: number, roundId: number) => {
        await redisDb.hSet(this._room, {
            'gameInProgress': state,
            'roundId': roundId
        })
    }

    /**
     * This functions resets certains fields so next rounds can be played
     * @param  {number} state
     */
    resetRoomFieldsData = async(state: number) => {
        await redisDb.hSet(this._room, { 
            'gameInProgress': state,
            'playersReady': 0,
            'numOfDataReceived': 0
        })
        await redisDb.hDel(this._room, 'evalInProgress')
    }
    
    // same as craete Player
    addPlayer = async(username: string, id: number, sessionToken: string ) => {
        // unique key
        await redisDb.hSet(`players:${this._room}`, { [username]: id})
        const value: PlayerValues = {
            id: id,
            points: 0,
            sessionToken: sessionToken,
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
        await redisDb.hSet(`${username}:${this._room}`, value)
    }
    playerExists = async(username: string) => {
        return Number(await redisDb.exists(`${username}:${this._room}`))
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
       // 3000 is grace period if client sents game force req
       const expiresAt = new Date().getTime() + delay + 4000
        console.log(expiresAt)
        return await redisDb.hSet(`round:timer:${this._room}`, {
            'roundId': roundId,
            'room': this._room,
            'expiresAt': expiresAt,
            'mode': mode
        })
    }
    getRoundTimeLimit = async(room: string) => {
        return Number(await redisDb.hGet(room, 'roundTimeLimit'))
    }
    static delRoundTimer = async(room: string) => {
        return await redisDb.unlink(`round:timer:${room}`)
    }

    /**
     * This function is used to update round timer when force game end is requested
     * @param  {number} delay - Time that client has to send data for evaluation in ms
     */
    updateRoundTimer = async(delay: number) => {
        const expiresAt = new Date().getTime() + delay
        await redisDb.hSet(`round:timer:${this._room}`, 'expiresAt', delay)
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
    
    /**
     * This function is called to rollback changes in case game doesn't start
     * It rolls round and letter, unreadies all players and sets game in progress to 0
     */
    rollBackGameStart = async() => {
        // Reroll letter with sets when letters are changed into sets
        await this.rollBackLetter()
        await this.unReadyAll()
        await this.resetRoomFieldsData(0)
        await redisDb.hIncrBy(this._room, 'roundNumber', -1)
    }
    
    /**
     * Make letters set for room
     * @param  {string} room
     */
    static setDefaultLetters = async(room: string) => {
        await redisDb.sAdd(`${room}:letters`, defaultLetters)
    }

    /**
     * Chooses next letter and removes it from the set
     */
    chooseNextLetter = async() => {
        return await redisDb.sPop(`${this._room}:letters`)
    }

    /**
     * Sets current letter in room hash
     * @param  {string} letter Current letter
     */
    setCurrentLetter = async(letter: string) => {
        await redisDb.hSet(`${this._room}`, 'currentLetter', letter)
    }
    
    /**
     * Gets current letter from a room
     */
    getCurrentLetter = async() => {
        return await redisDb.hGet(`${this._room}`, 'currentLetter') 
    }
    /**
     * This function is called to clean all the keys when game is finished and no letters are left
     */
    closeRoom = async() => {
        const unlinkArr = [this._room, `players:${this._room}`, `rounds:${this._room}`]
        const players = await this.getPlayerNames()
        await players.forEach(async(username: string) => await unlinkArr.push(`${username}:${this._room}`))
        await redisDb.unlink(unlinkArr)
    }

    
    /**
     * This function rollbacks letter in case of error during game start
     */
    rollBackLetter = async() => {
        const currentLetter = await this.getCurrentLetter()
        await redisDb.sAdd(`${this._room}:letters`, currentLetter)
    }
  
}

