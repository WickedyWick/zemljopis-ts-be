// https://github.com/PatMan10/testing_socketIO_server
const io = require('socket.io-client')
import { EVENTS } from 'sockets/game.sockets'
import * as dotenv from 'dotenv'
import { Socket } from 'socket.io-client'
import fetch from 'node-fetch'
import axios from 'axios'

interface JoinRoomInterface {
    CODE: number,
    0: string,
    1: string,
    2: string,
    3: string,
    4: string,
    points: string,
    ready: string,
    players: string[]
}
interface CreateRoomInterface { 
    roomCode?: string,
    sessionToken?: string
}
const port = process.env.PORT || 8000
const initSocket = () => {
    return new Promise((resolve, reject) => {
        const socket = io(`http://localhost:${port}`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        })
        // define event handler for sucessfull connection
        socket.on('connect', () => {
            resolve(socket)
        })

        setTimeout(() => {
            reject(new Error('Failed to connect within 5 seconds'))
        }, 5000)
    })
}


const destroySocket = (socket: Socket) => {
    return new Promise((resolve, reject) => {
        if (socket.connected) {
            socket.disconnect()
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

describe('Sockets', () => {
    it.each([
        { roundTimeLimit: '60', playerCount: '1' },
        { roundTimeLimit: '90', playerCount: '1' },
        { roundTimeLimit: '120', playerCount: '1' },
        { roundTimeLimit: '180', playerCount: '1' }
    ])
    ('should join room if solo player', async({ roundTimeLimit, playerCount }) => {
        //@ts-ignore
        const clientSocket: Socket = await initSocket()
        const username = `AleksaTest`
        const response = await axios({
            method: 'post',
            url: 'http://localhost:8000/home/createGame',
            data: {
                username,
                roundTimeLimit,
                playerCount
            },
            timeout: 20000
        })

        const data = await response.data

        const serverResponse: Promise<JoinRoomInterface> | Error = new Promise((resolve, reject) => {
            clientSocket.on('joinRoom', (response: JoinRoomInterface) => {
                const _response = response
                destroySocket(clientSocket)
                resolve(_response)
            })

            setTimeout(() => {
                reject(new Error('Failed to get response, connection timed out...'))
            }, 5000)
        })
        
        clientSocket.emit(EVENTS.JOIN_ROOM, ({
            username,
            roomCode: data.roomCode,
            sessionToken: data.sessionToken 
        }))

        const serverRes: JoinRoomInterface = await serverResponse

        expect(serverRes.CODE).toBe(200)
        expect(serverRes.points).toBe('0')
        expect(serverRes.ready).toBe(null)
        expect(serverRes.players[0]).toBe(username)
        expect(serverRes.players).toHaveLength(1)
        expect(serverRes[0]).toBe('0')
        expect(serverRes[1]).toBe(`${playerCount}`)
        expect(serverRes[2]).toBe('0')
        expect(serverRes[3]).toBe(`${roundTimeLimit}`)
        expect(serverRes[4]).toBe('0')
    })
})