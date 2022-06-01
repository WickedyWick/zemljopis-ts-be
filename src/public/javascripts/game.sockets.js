import socket from './game.js'
import { joinRoom, playerReadyResponse, playerUnReadyReadyResponse } from './game.functions.js'
socket.on('test',()=> {
    console.log("TEST")
})

socket.on('joinRoom', (data) =>{
    console.log(data)
    joinRoom(data)
})

socket.on('playerReady', (data) => {
    console.log(data)
    playerReadyResponse(data)
})

socket.on('playerUnReady', (data) => {
    console.log(data)
    playerUnReadyReadyResponse(data)
})

