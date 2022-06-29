import { redisDb } from './index'
import { defaultLetters } from 'utils/strings'
import { RedisSearchLanguages } from '@node-redis/search/dist/commands'
import { Server, Socket } from 'socket.io'
import { EVENTS } from 'sockets/game.sockets'

export interface GameFields {
    playerCount: number,
    playersReady: number,
    roundNumber: number,
    roundTimeLimit: number,
    roundActive: number,
    roundId: number | null,
    roundIds: any,
    players: any,
    playersIds: any,
    availableLetters: string[],
    currentLetter: string,
    evalFuncExecuting: number,
    data: any, // strongtype this later
    created_at: Date | string // not nessesarry in redis?
    active: boolean
    playersRegistered: number
}
 //pogledaj value ts

export class GameData {
    private _name: string

    constructor (name: string) {
        this._name = name
    }
    static roomExists = async(room: string) => {
        return await redisDb.exists(room)
    }
    static createRoom = async(room: string,username: string, playerCount: number, roundTimeLimit: number) => {
        const value: GameFields = {
            playerCount,
            playersReady: 0,
            roundNumber: 1,
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
        }
        //@ts-ignore
        await redisDb.hSet(room, value)
        // 12h
        //await redisDb.expireAt(room, 43200)

        return new this(username)
    }

    static createPlayer = async(room: string, username: string, id: number, sessionToken: string) => {
        await redisDb.hSet(`players_${room}`, { [username]: id})
        await redisDb.hSet(`${username}_${room}`, { id: id, points: 0, sessionToken: sessionToken, ready: 0 })
    }

    static createRounds = async(room: string, roundNumber: number, id: number) => {
        await redisDb.hSet(`rounds_${room}`, { [roundNumber]: id })
    }
    static checkSessionToken = async(room: string, username: string, sessionToken: string) => {
        const sT = await redisDb.hGet(`${username}_${room}`, 'sessionToken')
        return sT === sessionToken
    }
    static playerReady = async(room: string, username: string) => {
        try {
            const ready = await redisDb.hGet(`${username}_${room}`, 'ready')
            let pReady = -1
            if(ready == '0') {
                const data = await redisDb.hmGet(room, ['playersReady', 'playerCount'])
                await redisDb.hSet(`${username}_${room}`, 'ready', 1)
                const updated = Number(data[0]) + 1
                if (updated <= Number(data[1]) && Number(data[0]) >= 0) {
                    pReady = await redisDb.hIncrBy(room, 'playersReady', 1)
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

    trackSocket = async(socketId: string, username: string, room: string) => {
        try {
            await redisDb.hSet(socketId, { username: username, room: room })
        } catch (e) {
            console.error(`Error tracking socket. Username: ${ username }\nSocketID: ${ socketId }\nErr : ${e}`)
        }
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
        const res = await redisDb.hmGet(this._name, ['playersReady', 'playerCount', 'roundNumber', 'roundTimeLimit', 'roundActive'])
        const players = await redisDb.hKeys(`players_${this._name}`)
        const pointsAndReady = await redisDb.hmGet(`${username}_${this._name}`,['points', 'ready'])

        // code consistency ?
        return {
            code: 200,
            ...res,
            points: pointsAndReady[0],
            ready: pointsAndReady[1],
            players: players
        }
    }
    // same as craete Player
    addPlayer = async(username: string, id: number, sessionToken: string ) => {
        // unique key
        await redisDb.hSet(`players_${this._name}`, { [username]: id})
        await redisDb.hSet(`${username}_${this._name}`, { id: id, points: 0, sessionToken: sessionToken, ready: 0 })
    }
    playerExists = async(username: string) => {
        return Number(await redisDb.exists(`${username}_${this._name}`))
    }

    // combine getplayer ciount and players joined in one query with hmGet?
    getPlayerCount = async() => {
        return Number(await redisDb.hGet(this._name, 'playerCount'))
    }
    getPlayersJoined = async() => {
        return Number(await redisDb.hGet(this._name, 'playerRegistered'))
    }
    setHash = async(key: string, value: Partial<GameFields>) => {
        // @ts-ignore
        return await redisDb.hSet(key, value)
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

