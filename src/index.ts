import express from 'express'
import { configure } from './utils/configure'
import socketio, { Server } from 'socket.io'
import { registerGameHandlers } from './sockets/game.sockets'
import { routes } from './routes'
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents } from 'utils/socketTypes'
const app = express()

app.use(express.static(__dirname + '\\public'))
configure(app)
app.use(express.static('src/public'))
const server = app.listen(process.env.PORT, () => {
    console.log(`--> Server started at http://localhost:${process.env.PORT}`)
})
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(server)
const onConnection = async(socket: socketio.Socket) => {
    socket.emit('test', 'test')
    registerGameHandlers(io, socket)
}

app.use(routes)
io.on('connection', onConnection)
export const dir = __dirname
export default app