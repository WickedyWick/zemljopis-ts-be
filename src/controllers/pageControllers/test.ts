import { Action } from "utils/typings";
import { redisDb } from "redis";
import { forEachLeadingCommentRange } from "typescript";
export const test: Action<any, any, any, any> = async(req, res ,next) => {
    let dic:any = {}

    let val = { playerCount:1,
        playersReady: 0,
        roundNumber: 1,
        roundTimeLimit: 1,
        roundActive: 0,
        roundId: -1,
        roundIds: {},
        players: {},
        playersIds: {},
        availableLetters: ["a","b","c","č","ć","d","dž","đ","e","f","g","h","i","j","k","l","lj","m","n","nj","o","p","r","s","š","t","u","v","z","ž"],
        currentLetter: '',
        evalFuncExecuting: 0,
        data: {},
        created_at: new Date(),
        active: true}

    console.time('dictionary set')
    for(let i =0; i<10000; i++) {
         dic[`perftest${i}`] = val
    }
    console.timeEnd('dictionary set')
    console.time('redis set')
    for(let i=0;i<10000; i++) {
        // @ts-ignore
         redisDb.hSet(`perftest2${i}`, val)
    }
    console.timeEnd('redis set')

    console.time('dictionary get')
    for(let i=0; i<10000; i++) {
        const t =  dic[`perftest${i}`]
    }
    console.timeEnd('dictionary get')
    
    console.time('redis get')
    for(let i=0;i<10000;i++) {
        const t =  redisDb.hGetAll(`perftest2${i}`)
    }
    console.timeEnd('redis get')
    console.time('dic get int')
    for(let i=0; i<10000; i++) {
        const t =  dic[`perftest${i}`]['playersReady']
    }
    console.timeEnd('dic get int')
    console.time('redis get int')
    for(let i=0;i<10000;i++) {
        const t = redisDb.hGet(`perftest2${i}`, 'playersReady')
    }
    console.timeEnd('redis get int')

    return res.status(200)
}