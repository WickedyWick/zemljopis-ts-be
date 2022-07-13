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

let taskQueue = queue<EnqueueData, Error>(async(task, callback) => {
    try {
        await evaluate(task.room)
    } catch(e) {
        console.log("LOLOKLOOLOLOLOLOLOLOLOLOOLOLOLOLOLOL")
    }
}, 1)

//taskQueue.pushAsync({ room: "", mode: "endRound", roundId: 1})
export const Queue = taskQueue
