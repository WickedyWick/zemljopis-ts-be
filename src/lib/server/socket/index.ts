import type { Server } from "socket.io";

export const setupSocketListeners = async(io: Server) => {
  io.on('connection', (socket) => {
    
  });
}