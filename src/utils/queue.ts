class Queue {

    elements: string[]

    constructor() {
        this.elements = []
    }

    enqueue = async(room: string) => {
        this.elements.push(room)
    }

    dequeue = async() => {
        const item = this.elements.pop()
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
}

export const queue = new Queue()