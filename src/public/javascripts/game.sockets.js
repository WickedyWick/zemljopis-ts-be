import { gameStart, joinRoomResponse , playerReadyResponse, playerUnReadyReadyResponse } from './game.functions.js'

let serverAddress = 'http://localhost:8000'
const socket = await io(serverAddress);
export default socket

export const SOCKET_EVENTS = {
    JOIN_ROOM : 'joinRoom',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_READY: 'playerReady',
    PLAYER_UNREADY: 'playerUnReady',
    GAME_START: 'gameStart',
    RECEIVE_DATA: 'receiveData',
    RESULT: 'result'
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

socket.on(SOCKET_EVENTS.RESULT, (data) => {
    console.log(data)
    
})
/**
 * Game start socket event 
 * @param {string} letter - Letter that words should start with
 * @param {string} roundNumber - Round number of the game
 */
socket.on(SOCKET_EVENTS.GAME_START, (data) => {
    console.log(data)
    gameStart(data)
})

