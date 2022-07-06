import { GameData } from "redisDb/game"

export interface EnqueueData {
    roundId: number
    room: string
    mode: "endRound" | "force"
}

class Queue {

    elements: EnqueueData[]

    constructor() {
        this.elements = []
    }

    enqueue = async(data: EnqueueData) => {
        this.elements.push(data)
    }

    dequeue = async() => {
        const item: EnqueueData = this.elements.pop()
        return item
    }

    peek = async() => {
        return this.elements[0]
    }

    length = async() => {
        return this.elements.length
    }

    isEmpty = async() => {
        return this.elements.length === 0
    }

    startQueue = async() => {
        while(await !this.isEmpty()) {
            // posibly have it input more than 1 like last 3 or 5

            // rethink this -> need to import data and c heck iof there is data sent
            const data: EnqueueData = await this.dequeue()
            if (data.mode == 'force') {
                // evaluate
            } else {
                // add to timer with 2 sec cd incase there are internet troubles ? but this doesn't make lots of sense lately
                // better maybe just to give a bit of overhead on the first timer and things should be fine
                // this prob has to exist for force finish , remove from redis if everyone sends tahta and call func directly that way its not in the queue
                const gameData = new GameData(data.room)
                await gameData.addRoundTimer(data.roundId, 'force', 2000)
            }
        }
    }

}

export const queue = new Queue()