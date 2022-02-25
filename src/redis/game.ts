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
}
 //pogledaj value ts

export class GameData {


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

    createRoom = async(room:string, playerCount: number, roundTimeLimit: number) => {
        // this is default game room setup, moved to this function so controller looks more readable at first glance
        const value: GameFields = {
            playerCount,
            playersReady: 0,
            roundNumber: 1,
            roundTimeLimit,
            roundActive: 0,
            roundId: null,
            roundIds: {},
            players: {},
            playersIds: {},
            availableLetters: defaultLetters,
            currentLetter: '',
            evalFuncExecuting: 0,
            data: {},
            created_at: new Date()
        }
        // @ts-ignore
        await redisDb.hSet(room, value)
        // 12h
        await redisDb.expireAt(room, 43200)
    }

    addPlayerMap = async(room: string, key: string, value: number) => {

    }

}
export const gameData = new GameData()
