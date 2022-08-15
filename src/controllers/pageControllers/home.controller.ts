import { Action } from 'utils/typings'
import { Room, Player } from 'database/models'
import { RoomModel } from 'database/models/room'
import { makeRoomCode } from 'utils/strings'
import { ERROR_ROOM_CREATE, ERROR_REG_PLAYER, ERROR_UNDEFINED_PARAMS } from 'utils/errors/home'
import { randomBytes } from 'crypto'
import { GameData } from 'redisDb/game'
interface RoomBody {
    username: string
    playerCount: number
    roundTimeLimit: number
}
export const createRoom: Action<any, RoomBody, any , any> = async (req, res, next) => {
    const { username, playerCount, roundTimeLimit } = await req.body
    const roomCode:string = await makeRoomCode()
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
            username,
            playerCount,
            roundTimeLimit,
        )

    } catch (e) {
        //check if its dupe
        console.error(`${ new Date().toLocaleString() }: ${ e }`)
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
        await GameData.createPlayer(roomCode, username, player.id, sessionToken)
    } catch (err) {
        console.log(`Error during creating player. Err : ${err}`)
        return next(ERROR_ROOM_CREATE)
    }
    // change that to return only sess
    res.status(201).json({ sessionToken , roomCode })
}

export const regUser: Action<any, any, any, any> = async(req, res, next) => {
    const { username, roomCode } = req.body
    if (!username || !roomCode)  {
        return next(ERROR_UNDEFINED_PARAMS)
    }
    const exists: number = await GameData.roomExists(roomCode)
    if (exists == 1) {
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
                await roomR.addPlayer(username, player.id, sessionToken)
                //send only sess
                return res.status(201).json({ username, roomCode, sessionToken })
            } catch (err) {
                // check
                console.log(err.code)
                console.log(`Error during creating player. Err : ${err}`)
                return next(ERROR_REG_PLAYER)
            }
        }

    } else {
        return res.status(404).json({ ERR_MSG: 'Soba ne postoji.'})
    }
}