import socket from './game.js'

socket.on('test',()=> {
    console.log("TEST")
})

socket.on('joinRoom', (data) =>{
    console.log(data)
    joinRoom(data)
})

socket.on('playerReady', (data) => {
    console.log(data)
    playerReady(data)
})

socket.on('playerUnReady', (data) => {
    console.log(data)
    playerUnReady(data)
})

