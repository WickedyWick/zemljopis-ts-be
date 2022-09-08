import express from 'express'
import { configure } from './utils/configure'
import socketio, { Server } from 'socket.io'
import { registerGameHandlers, registerDisconnect } from './sockets/game.sockets'
import { routes } from './routes'
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents } from 'utils/socketTypes'
import { startTimerAndQueue } from 'utils/timer'
import * as Sentry from "@sentry/node"
import * as Tracing from "@sentry/tracing"
import * as dotenv from 'dotenv'
dotenv.config()
const app = express()

Sentry.init({
    dsn: process.env.DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
  
    tracesSampleRate: parseFloat(process.env.TRACES_SAMPLE_RATE) || 0.2
})

configure(app)

app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

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

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler({
    shouldHandleError() { return true }
}));

io.on('connection', onConnection)
export const IO = io
export const dir = __dirname
export default app
