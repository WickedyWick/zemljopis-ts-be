import { GameData } from "redisDb/game"
import { Queue } from "./queue"
export const startTimerAndQueue = async() => {
    setInterval(async() => {
        const res = await GameData.getExpiredRoundTimers()
        for(let i =0 ;i < res.total;i ++) {
            try {
                console.log('que?!!??!')
                await Queue.push({
                    room: res.documents[i].value.room as string,
                    mode: "endRound",
                    roundId: res.documents[i].value.roundId as number
                }, () => {console.log('done')})
                console.log(`${res.documents[i].value.room} enqueued`)
                await GameData.delRoundTimer(res.documents[i].value.roundId as number)
                console.log(`${res.documents[i].value.room} deleted`)
            } catch(e) {
               // console.log(`Queuing failed for eval data: ${res}\n Retrying. Err: ${ e }`)
            }
        }
    }, 1000)
}