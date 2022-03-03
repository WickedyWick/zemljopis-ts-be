import { Action } from 'utils/typings'
import { Room, Player } from 'database/models'
import { makeRoomCode } from 'utils/strings'
import { ERROR_ROOM_CREATE } from 'utils/errors/home'
import { randomBytes } from 'crypto'
interface RoomBody {
    username: string
    playerCount: number
    roundTimeLimit: number
}
export const createRoom: Action<any, RoomBody, any , any> = async (req, res, next) => {
    const { username, playerCount, roundTimeLimit } = req.body
    console.log(req.body)
    const roomCode = await makeRoomCode()
    if (roomCode === '') return next(ERROR_ROOM_CREATE)
    // check for unique
    try {
        const room = await Room.create({
            'player_count': playerCount,
            'round_time_limit': roundTimeLimit,
            'room_code': roomCode
        })

    } catch (err) {
        //check if its dupe
        console.log(err)
        return next(ERROR_ROOM_CREATE)
    }
    try {
        const sessionToken = await randomBytes(48).toString('hex')
        console.log(sessionToken)
        const player = await Player.create({
            'username': username,
            'room_code': roomCode,
            'session_token': sessionToken,
        }, true)
    } catch (err) {
        console.log(err)
        return next(ERROR_ROOM_CREATE)
    }

    res.json({ roomCode, username }).status(200)

}
