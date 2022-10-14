
/*import request from 'supertest'
import app from 'index'
import socketio , { Server } from 'socket.io'
const Client = require('socket.io-client')
const express = require('express')
const { createServer } = require('http')
import { EVENTS } from '../sockets/game.sockets'
const nameCreator = async() => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

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
/*
describe('Todos API', () => {
    it('POST /home/createGame --> return sessionToken', async() => {
        const name:string = await nameCreator()
        const response = await request(app)
            .post('/home/createGame')
            .send({ username: name, playerCount: 1, roundTimeLimit: 60 })
            .expect(201)
        expect(response.body.sessionToken).toEqual(expect.any(String))
        expect(response.body.roomCode).toEqual(expect.any(String))
    });
    it('POST /home/regUser --> return sessionToken', async() => {
        const name:string = await nameCreator()
        const response = await request(app)
            .post('/home/createGame')
            .send({ username: name, playerCount: 2, roundTimeLimit: 120 })
            .expect(201)
        await expect(response.body.sessionToken).toEqual(expect.any(String))
        await expect(response.body.roomCode).toEqual(expect.any(String))
        let room = await response.body.roomCode
        const name2:string = await nameCreator()
        const regResponse = await request(app)
            .post('/home/regUser')
            .send({ username: name2, roomCode: room })
            .expect(201)
        expect(response.body.sessionToken).toEqual(expect.any(String))
    })
    it('POST /home/regUser --> return 404', async() => {
        const response = await request(app)
            .post('/home/regUser')
            .send({ username:'test1234' , roomCode: '11111111' })
            .expect(404)
    });
    it('POST /home/regUser --> return 400', async() => {
        const response = await request(app)
            .post('/home/regUser')
            .send({ username: 'test11' , roomCode: '11' })
            .expect(400)
        const response1 = await request(app)
            .post('/home/regUser')
            .send({ username: 'tet' , roomCode: '11111111' })
            .expect(400)
    })
})
*/
/*
describe('API', () => {
    it('API', async() => {
        const response = await request(app)
        .post('/home/createGame')
        .send({ username: 'test', playerCount: 1, roundTimeLimit: 60 })
        .expect(201)
    })
    
})


*/