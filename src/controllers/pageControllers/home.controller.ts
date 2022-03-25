import { Action } from 'utils/typings'
import { Room, Player } from 'database/models'
import { makeRoomCode } from 'utils/strings'
import { ERROR_ROOM_CREATE } from 'utils/errors/home'
import { randomBytes } from 'crypto'
import { GameData } from 'redis/game'
interface RoomBody {
    username: string
    playerCount: number
    roundTimeLimit: number
}
export const createRoom: Action<any, RoomBody, any , any> = async (req, res, next) => {
    const { username, playerCount, roundTimeLimit } = req.body
    console.log(req.body)
    console.log('here')
    const roomCode = await makeRoomCode()
    console.log(roomCode)
    if (roomCode === '') return next(ERROR_ROOM_CREATE)
    // check for unique
    try {
        const room = await Room.create({
            'player_count': playerCount,
            'round_time_limit': roundTimeLimit,
            'room_code': roomCode
        })

        await GameData.createRoom(
            roomCode,
            playerCount,
            roundTimeLimit,
        )

    } catch (err) {
        //check if its dupe
        console.error(err)
        return next(ERROR_ROOM_CREATE)
    }
    let sessionToken;
    try {
        sessionToken = await randomBytes(48).toString('hex')
        const player = await Player.create({
            'username': username,
            'room_code': roomCode,
            'session_token': sessionToken,
        }, true)
        await GameData.createPlayers(roomCode, username, player.id)
    } catch (err) {
        console.log(`Error during creating player. Err : ${err}`)
        return next(ERROR_ROOM_CREATE)
    }

    res.json({ roomCode, username, sessionToken }).status(200)
}

export const regUser: Action<any, any, any, any> = async(req, res, next) => {
    const { username, roomCode } = req.body

    if (await GameData.roomExists(roomCode)) {
       // const room = await Room.findBy({ room_code: roomCode })
        const roomR = new GameData(roomCode)
       // if(!room) return next()

        const playersJoined = await roomR.getPlayersJoined()
        const playersCount = await roomR.getPlayerCount()
        if(playersJoined < playersCount) {
            // there is space
            let sessionToken;
            try {
                sessionToken = await randomBytes(48).toString('hex')
                const player = await Player.create({
                    'username': username,
                    'room_code': roomCode,
                    'session_token': sessionToken,
                }, true)
                await roomR.addPlayer(username, player.id)
            } catch (err) {
                console.log(`Error during creating player. Err : ${err}`)
                return next(ERROR_ROOM_CREATE)
            // use separate keys and arrays for palyers and stuff

            }
            return res.status(200)
        }
        // there isn't space (room is full)

    }
    return res.json({ ERR_MSG: 'Soba ne postoji.'}).status(404)

}