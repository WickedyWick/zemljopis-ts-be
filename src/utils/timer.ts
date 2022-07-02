import { GameData } from "redisDb/game"
import { queue } from "./queue"
export const startTimerAndQueue = async() => {
    setInterval(async() => {
        const res = await GameData.getExpiredRoundTimers()
        for(let i =0 ;i < res.total;i ++) {
            await queue.enqueue({
                room: res.documents[i].value.room as string,
                mode: "endRound",
                roundId: res.documents[i].value.roundId as number
            })
            console.log(`${res.documents[i].value.room} enqueued`)
            await GameData.delRoundTimer(res.documents[i].value.roundId as number)
            console.log(`${res.documents[i].value.room} deleted`)
        }
    }, 1000)
}