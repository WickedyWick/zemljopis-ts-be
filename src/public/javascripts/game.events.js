

$('#btnReady').on('click', (e) => {
    if(gameStarted) {
        // you will serve data here
        return
    } 
    if(!ready) {
        socket.emit('playerReady', ({ username, roomCode, sessionToken }))
        $('#btnReady').prop('disabled', true)
        return
    }
    socket.emit('playerUnReady', ({ username, roomCode, sessionToken }))
    $('#btnReady').prob('disabled', true)
    return
})

