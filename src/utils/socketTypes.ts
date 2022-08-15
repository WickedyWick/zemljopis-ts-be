export interface joinRoomInterface {
    username: string
    roomCode: string
    sessionToken: string
}

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  result: (data: {[k: string]: number}) => void
}

export  interface ClientToServerEvents {
  joinRoom: (username: string, roomCode: string, sessionToken: string) => void;
}

export  interface InterServerEvents {
    
}

export  interface SocketData {
  name: string;
  age: number;
}