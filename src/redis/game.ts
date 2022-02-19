import { DefaultDeserializer } from 'v8'
import { redisDb } from './index'

export interface DefaultHashValue {
    playerCount: number,
    playersReady: number,
    roundNumber: number,
    roundTimeLimit: number,
    roundActive: boolean,
    roundId: number,
    roundIds: any,
    players: any,
    playersIds: any,
    intervalObj: TimerHandler,
    availableLetters: string[],
    currentLetter: string,
    evalFuncExecuting: boolean,
    data: any,
    created_at: Date | string
}
//pogledaj value ts 
export const setHash = async(key: string, value: { [K in keyof DefaultHashValue]: any }) => {
    return await redisDb.hSet(key, value)
}

export const getHashByKey = async(setKey: string, valKey: string) => {
    return await redisDb.hGet(setKey, valKey)
}

export const getHashAll = async(setKey: string) => {
    return await redisDb.hGetAll(setKey)
}

export const updateHash = async(key: string, value: { [K in keyof DefaultHashValue]: any }) => {
    if (await redisDb.exists(key)) {
        await redisDb.hSet(key, value)
        return true
    } else {
        return false
    }
}
export const hashExists = async(key: string) => {
    return await redisDb.exists(key)
}