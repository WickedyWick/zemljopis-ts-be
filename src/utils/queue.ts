import { evaluate } from "controllers/socketHandlers/game.handler"
import { GameData } from "redisDb/game"
import { queue} from 'async'
import dotenv from 'dotenv'
dotenv.config()

export interface EnqueueData {
    roundId: number
    room: string
    mode: "endRound" | "force"
}

const taskQueue = queue<EnqueueData, string>(async(task, callback) => {
    try {
        console.log(`${ new Date().toLocaleString() }: ${task.room} evaluation started`)
        await evaluate(task.room)
        await GameData.delRoundTimer(task.roundId as number)
        callback(`${ new Date().toLocaleString() }: ${task.room} evaluation finished successufully`)
    } catch(e) {
        console.error(`${ new Date().toLocaleString() }: Error during perfoming queue task. RoundId: ${ task.roundId }.\n ERR : ${ e }`)
        callback(`${ new Date().toLocaleString() }: Error during perfoming queue task. RoundId: ${ task.roundId }.\n ERR : ${ e }`)

    }
}, Number(process.env.CONCURENT_WORKERS) ?? 1)

export const Queue = taskQueue
