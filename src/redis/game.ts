import { redisDb } from './index'
import { defaultLetters } from 'utils/strings'
import { RedisSearchLanguages } from '@node-redis/search/dist/commands'

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
        await redisDb.hSet(`${username}_${room}`, { id: id, points: 0, sessionToken: sessionToken })
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
            if(ready == '0') {
                const data = await redisDb.hmGet(room, ['playersReady', 'playerCount'])
                await redisDb.hSet(`${username}_${room}`, 'ready', 1)
                await redisDb.hSet(room, 'playersReady', Number(data[0]) + 1)
            }
            return 1
        } catch(e) {
            console.error(`Error during player ready up: ERR: ${e}`)
            return 0
        }
    }
    static playerUnReady = async(room: string, username: string) => {
        try {
            const ready = await redisDb.hGet(`${username}_${room}`, 'ready')
            if ( ready == '1') {
                const data = await redisDb.hmGet(room, ['playersReady', 'playerCount'])
                await redisDb.hSet(`${username}_${room}`, 'ready', 1)
                await redisDb.hSet(room, 'playersReady', Number(data[0]) - 1)
            }
            return 1
        } catch(e) {
            return 0
        }
    }
    
    retrieveJoinRoomData = async(username: string, code?: 200) => {
        const res = await redisDb.hmGet(this._name, ['playersReady', 'playerCount', 'roundNumber', 'roundTimeLimit', 'roundActive'])
        const players = await redisDb.hKeys(`players_${this._name}`)
        const points = await redisDb.hGet(`${username}_${this._name}`,'points')
        return {
            code: 200,
            ...res,
            points,
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

