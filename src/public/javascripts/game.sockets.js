import { joinRoomResponse , playerReadyResponse, playerUnReadyReadyResponse } from './game.functions.js'

let serverAddress = 'http://localhost:8000'
const socket = await io(serverAddress);
export default socket

export const SOCKET_EVENTS = {
    JOIN_ROOM : 'joinRoom',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_READY: 'playerReady',
    PLAYER_UNREADY: 'playerUnReady'
}

socket.on('test',()=> {
    console.log("TEST")
})

socket.on(SOCKET_EVENTS.JOIN_ROOM, (data) =>{
    console.log(data)
    joinRoomResponse(data)
})

socket.on(SOCKET_EVENTS.PLAYER_READY, (data) => {
    console.log(data)
    playerReadyResponse(data)
})

socket.on(SOCKET_EVENTS.PLAYER_UNREADY, (data) => {
    console.log(data)
    playerUnReadyReadyResponse(data)
})

