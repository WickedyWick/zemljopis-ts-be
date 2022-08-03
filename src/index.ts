import express from 'express'
import { configure } from './utils/configure'
import socketio, { Server } from 'socket.io'
import { registerGameHandlers, registerDisconnect } from './sockets/game.sockets'
import { routes } from './routes'
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents } from 'utils/socketTypes'
import { startTimerAndQueue } from 'utils/timer'
const app = express()


configure(app)
app.use(express.static('src/public', { extensions: ['js'] }))
const server = app.listen(process.env.PORT, () => {
    console.log(`--> Server started at http://localhost:${process.env.PORT}`)
})
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(server)
const onConnection = async(socket: socketio.Socket) => {
    registerGameHandlers(io, socket)
    registerDisconnect(io, socket)
}
startTimerAndQueue()
app.use(routes)
io.on('connection', onConnection)
export const IO = io
export const dir = __dirname
export default app