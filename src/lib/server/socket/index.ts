import type { Server, Socket } from "socket.io";
import { addVisitor } from "../db/commands";
export const setupSocketListeners = async(io: Server) => {
  io.on('connection', async(socket: Socket):Promise<any> => {
    await addVisitor()
    socket.on('loginPlayer', ({username}) => test(username));
    socket.on('test', test)
  });
}

const test = (username: string) => {}