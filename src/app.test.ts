
import request from 'supertest'
import app from 'index'
const express = require('express')
const nameCreator = async() => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}
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

