import express from 'express'
import { configure } from './utils/configure'
import socketio, { Server } from 'socket.io'
import { registerGameHandlers } from './sockets/game.sockets'
const app = express()

configure(app)

const server = app.listen(process.env.PORT, () => {
    console.log(`--> Server started at http://localhost:${process.env.PORT}`)
})
const io = new Server(server)
const onConnection = async(socket: socketio.Socket) => {
    await registerGameHandlers(io, socket)
}
app.get('/', (req, res) => {
    res.setHeader("Content-Type","text/html;charset=UTF-8")
    res.sendFile('./views/test.html',{root:__dirname})
})

io.on('connection', onConnection)


