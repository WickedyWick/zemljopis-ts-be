import { RedisClientType } from "redis";


export class transactionClient {

    client: RedisClientType
    room: string
    constructor(_client: RedisClientType, _room: string) {
        this.client = _client
        this.room = _room
    }

    /**
     * This functions readys up a player and increments players ready on room key
     * @param  {Server} io - global io instance,  prob not nessary
     * @param  {string} room
     * @param  {string} username
     */
    playerReady = async(username: string) => {
        // Lua scripts might be better here
        // multiple clients needed for something like this?
        await this.client.watch(this.room)
        await this.client.watch(`${username}_${this.room}`)
        let pReady = -1
        const [setNXReply, getReply] = await this.client
            .multi()
            .hSetNX(`${username}_${this.room}`, 'ready', '1')
            .hmGet(this.room, ['playersReady', 'playerCount'])
            .exec()
        
        // race condition error
        // @ts-ignore
        if (setNXReply == null || getReply.length != 2) {
            return {
                CODE: 500,
                gameStart: false,
                playersReady: pReady
            }
        }
        
        //@ts-ignore
        const playerCount = getReply[1]
        if (setNXReply) {
            await this.client.watch(`${username}_${this.room}`)
            const [ pReady ] = await this.client
                .multi()
                .hIncrBy(this.room, 'playersReady', 1)
                .exec()

            if (pReady == playerCount){
                await this.client.hSet(this.room, 'gameInProgress', 1)
                return {
                    CODE: 200,
                    gameStart: true,
                    playersReady: pReady
                }
            }

            return {
                CODE: 200,
                gameStart: false,
                playersReady: pReady
            }
        }

        return {
            CODE: 200,
            gameStart: false,
            playersReady: pReady
        }

    }

    /**
     * This functions readys up a player and increments players ready on room key
     * @param  {Server} io - global io instance,  prob not nessary
     * @param  {string} room
     * @param  {string} username
     */
    playerUnReady = async(username: string) => {
        await this.client.watch(this.room)
        await this.client.watch(`${username}_${this.room}`)
        let pReady = -1
        const [ hDelRes ] = await this.client
            .multi()
            .hDel(`${username}_${this.room}`, 'ready')
            .exec()
        
        if (hDelRes == null) {
            return {
                CODE: 500,
                playersReady: pReady
            }
        }

        if (hDelRes) {
            await this.client.watch(`${username}_${this.room}`)
            const [ pReady ] = await this.client
                .multi()
                .hIncrBy(this.room, 'playersReady', -1)
                .exec()
            return {
                CODE: 200,
                playersReady: pReady
            }
        }

        return {
            CODE: 200,
            playersReady: pReady
        }
    }

}