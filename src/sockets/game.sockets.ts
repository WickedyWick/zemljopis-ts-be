import { Server, Socket } from "socket.io";

export const registerGameHandlers = async(io: Server, socket: Socket) => {
    const test = ({}) => {
        console.log('here')
    }
    socket.on('test', test)
}