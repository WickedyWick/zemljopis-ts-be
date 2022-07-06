import { evaluate } from "controllers/socketHandlers/game.handler"
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
            await evaluate(data.room)
        }
    }

}

export const queue = new Queue()