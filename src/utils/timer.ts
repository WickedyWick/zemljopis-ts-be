import { GameData } from "redisDb/game"
import { Queue } from "./queue"
export const startTimerAndQueue = async() => {
    setInterval(async() => {
        const res = await GameData.getExpiredRoundTimers()
        for(let i =0 ;i < res.total;i ++) {
            try {
                console.log(res)
                Queue.push({
                    room: res.documents[i].value.room as string,
                    mode: "endRound",
                    roundId: res.documents[i].value.roundId as number
                }, (msg: any) => {
                    console.log(msg)
                })
            } catch(e) {
               console.log(`Queuing failed for eval data: ${ res }\n Retrying. Err: ${ e }`)
            }
        }
    }, 1000)
}
