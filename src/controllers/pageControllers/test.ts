import { Action } from "utils/typings";
import { redisDb } from "redis";
export const test: Action<any, any, any, any> = async(req, res ,next) => {
    const timeout = setInterval(() => {}, 0)
    //@ts-ignore
    await redisDb.hset('testing', {"1": 265, 'timeout': timeout})
    
}