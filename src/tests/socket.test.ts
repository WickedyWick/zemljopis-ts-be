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
    roomCode: string,
    sessionToken: string
}

interface RegUserInterface {
    sessionToken: string
}

interface PlayerReadyInterface {
    username: string
    CODE: number,
    gameStart: boolean,
    playersReady: number | string
}

const port = process.env.PORT || 8000
const baseUrl = process.env.BASE_URL || 'http://localhost'

const initSocket = () => {
    return new Promise((resolve, reject) => {
        const socket = io(`${baseUrl}:${port}`, {
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
            url: `${baseUrl}:${port}/home/createGame`,
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

    it.each([
        { roundTimeLimit: '60', playerCount: '2' },
        { roundTimeLimit: '90', playerCount: '2' },
        { roundTimeLimit: '120', playerCount: '2' },
        { roundTimeLimit: '180', playerCount: '2' }
    ])
    ('should join room if multiple users', async({ roundTimeLimit, playerCount }) => {

        //@ts-ignore
        const clientSocket: Socket = await initSocket()
        const username = `AleksaTest`
        const createRoomApiResponse = await axios({
            method: 'post',
            url: `${baseUrl}:${port}/home/createGame`,
            data: {
                username,
                roundTimeLimit,
                playerCount
            },
            timeout: 20000
        })

        const createRoomData: CreateRoomInterface = await createRoomApiResponse.data

        const serverResponse: Promise<JoinRoomInterface> | Error = new Promise((resolve, reject) => {
            clientSocket.on(EVENTS.JOIN_ROOM, (response: JoinRoomInterface) => {
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
            roomCode: createRoomData.roomCode,
            sessionToken: createRoomData.sessionToken 
        }))

        const serverResData: JoinRoomInterface = await serverResponse

        expect(serverResData.CODE).toBe(200)
        expect(serverResData.points).toBe('0')
        expect(serverResData.ready).toBe(null)
        expect(serverResData.players[0]).toBe(username)
        expect(serverResData.players).toHaveLength(1)
        expect(serverResData[0]).toBe('0')
        expect(serverResData[1]).toBe(`${playerCount}`)
        expect(serverResData[2]).toBe('0')
        expect(serverResData[3]).toBe(`${roundTimeLimit}`)
        expect(serverResData[4]).toBe('0')

        //@ts-ignore
        const clientSocket2: Socket = await initSocket()

        const username2 = 'AleksaTest1'
        const regUserApiResponse = await axios({
            method: 'post',
            url: `${baseUrl}:${port}/home/regUser`,
            data: {
                username: username2,
                roomCode: createRoomData.roomCode
            },
            timeout: 20000
        })

        const regUserData: RegUserInterface = await regUserApiResponse.data

        const serverResponse2: Promise<JoinRoomInterface> | Error = new Promise((resolve, reject) => {
            clientSocket2.on(EVENTS.JOIN_ROOM, (response: JoinRoomInterface) => {
                const _response = response
                destroySocket(clientSocket2)
                resolve(_response)
            })

            setTimeout(() => {
                reject(new Error('Failed to get response, connection timed out...'))
            }, 5000)
        })

        clientSocket2.emit(EVENTS.JOIN_ROOM, ({
            username: username2,
            roomCode: createRoomData.roomCode,
            sessionToken: regUserData.sessionToken
        }))

        const serverResData2: JoinRoomInterface = await serverResponse2

        expect(serverResData2.CODE).toBe(200)
        expect(serverResData2.points).toBe('0')
        expect(serverResData2.ready).toBe(null)
        expect(serverResData2.players[0]).toBe(username)
        expect(serverResData2.players[1]).toBe(username2)
        expect(serverResData2.players).toHaveLength(2)
        expect(serverResData2[0]).toBe('0')
        expect(serverResData2[1]).toBe(`${playerCount}`)
        expect(serverResData2[2]).toBe('0')
        expect(serverResData2[3]).toBe(`${roundTimeLimit}`)
        expect(serverResData2[4]).toBe('0')
    })

    it('should ready up player', async() => {
        
        //@ts-ignore
        const clientSocket: Socket = await initSocket()
        const username = 'AleksaTest'
        
        const createRoomApiResponse = await axios({
            method: 'post',
            url: `${baseUrl}:${port}/home/createGame`,
            data: {
                username,
                roundTimeLimit: '60',
                playerCount: '1'
            },
            timeout: 20000
        })

        
        const createRoomData: CreateRoomInterface = await createRoomApiResponse.data

        const serverResponse1: Promise<JoinRoomInterface> | Error = new Promise((resolve, reject) => {
            clientSocket.on(EVENTS.JOIN_ROOM, (response: JoinRoomInterface) => {
                const _response = response
                resolve(_response)
            })

            setTimeout(() => {
                reject(new Error('Failed to get response, connection timed out...'))
            },5000)
        })

        clientSocket.emit(EVENTS.JOIN_ROOM, ({
            username,
            roomCode: createRoomData.roomCode,
            sessionToken: createRoomData.sessionToken
        }))
        
        const joinRoomData: JoinRoomInterface = await serverResponse1

        const serverResponse2: Promise<PlayerReadyInterface> | Error = new Promise((resolve, reject) => {
            clientSocket.on(EVENTS.PLAYER_READY, (response: PlayerReadyInterface) => {
                const _response = response
                destroySocket(clientSocket)
                resolve(_response)
            })

            setTimeout(() => {
                reject(new Error('Failed to get response, connection timed out...'))
            }, 5000)
        })

        clientSocket.emit(EVENTS.PLAYER_READY, ({
            username,
            roomCode: createRoomData.roomCode,
            sessionToken: createRoomData.sessionToken
        }))

        const serverResponseData: PlayerReadyInterface = await serverResponse2
        
        expect(serverResponseData.CODE).toBe(200)
        expect(serverResponseData.gameStart).toBe(true)
        expect(serverResponseData.playersReady).toBe(1)
        expect(serverResponseData.username).toBe(username)
    })

})
