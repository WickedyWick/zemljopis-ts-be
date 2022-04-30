import { redisDb } from './index'
import { defaultLetters } from 'utils/strings'

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
    static createRoom = async(room: string, playerCount: number, roundTimeLimit: number) => {
        const value: GameFields = {
            playerCount,
            playersReady: 0,
            roundNumber: 1,
            roundTimeLimit,
            roundActive: 0,
            roundId: -1,
            roundIds: {},
            players: {},
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
        /*
        const t = await redisDb.hGet(room, 'playerCount')
        console.log(typeof(t))
        console.log(t)
        */
    }

    static createPlayer = async(room: string, username: string, id: number, sessionToken: string) => {
        await redisDb.hSet(`${username}_${room}`, { id: id, points: 0, sessionToken: sessionToken })
    }
    static createRounds = async(room: string, roundNumber: number, id: number) => {
        await redisDb.hSet(`rounds_${room}`, { [roundNumber]: id })
    }
    retrieveJoinRoomData = async(username: string, code?: 200) => {
        const res = await redisDb.hmGet(this._name, ['playersReady', 'playerCount', 'roundNumber', 'roundTimeLimit', 'roundActive'])
        const points = await redisDb.hGet(`${username}_${this._name}`,'points')
        //care what you return dontexpose the ID
        return {
            code: 200,
            ...res,
            points
        }
    }
    addPlayer = async(username: string, id: number ) => {
        // unique key
        await redisDb.hSet(`${username}_${this._name}`, { id: id, points: 0, sessionToken: '' })
    }
    checkSessionToken = async(username: string, sessionToken: string) => {
        const sT = await redisDb.hGet(`${username}_${this._name}`, 'sessionToken')
        return sT == sessionToken
    }
    playerExists = async(username: string) => {
        return Number(await redisDb.exists(`${username}_${this._name}`))
    }
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

