import { gameStart, joinRoomResponse , resultHandler, playerReadyResponse, playerUnReadyReadyHandler, anotherPlayerJoin, sendDataTimerOrForce } from './game.functions.js'

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
    RESULT: 'result',
    FORCE_GAME_END: 'forceGameEnd'
}

socket.on('test',()=> {
    console.log("TEST")
})

socket.on(SOCKET_EVENTS.JOIN_ROOM, (data) =>{
    joinRoomResponse(data)
})

socket.on(SOCKET_EVENTS.PLAYER_READY, (data) => {
    playerReadyResponse(data)
})

socket.on(SOCKET_EVENTS.PLAYER_UNREADY, (data) => {
    playerUnReadyReadyHandler(data)
})

socket.on(SOCKET_EVENTS.RESULT, (data) => {
    resultHandler(data)
})
/**
 * Game start socket event 
 * @param {string} letter - Letter that words should start with
 * @param {string} roundNumber - Round number of the game
 */
socket.on(SOCKET_EVENTS.GAME_START, (data) => {
    gameStart(data)
})

/**
 * This event is triggered when another player joins the room
 * @param  {string} username
 * @param  {number} points
 */
socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
    anotherPlayerJoin(data)
})

/**
 * This event is triggered when someone force ends the game
 * @param  {string} username
 */
socket.on(SOCKET_EVENTS.FORCE_GAME_END, (username) => {
    sendDataTimerOrForce(false)
})
