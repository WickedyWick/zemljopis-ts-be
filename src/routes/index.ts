import { Router } from 'express'
import httpStatus from 'http-status'
import { dir } from 'index'
import { gameCreateValidator } from 'validators/homeValidator'
import { createRoom } from 'controllers/pageControllers/home.controller'
const router = Router()

router.get('/ping', (req, res) => {
    res.status(httpStatus.OK).send('success')
})

router.get('/android', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/android.html', { root: dir })
})

router.get('/game', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/game.html', { root: dir })
})

router.get('/en', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/indexEn.html', { root: dir })
})

router.get('/upustvo', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/uputstvo.html', { root: dir })
})

router.get('/utisci', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/utisci.html', { root: dir })
})

router.post('/createGame', createRoom)

router.get('/', (req,res) => {
    res.setHeader('Content-Type','text/html;charset=UTF-8')
    res.sendFile('./public/views/index.html', { root: dir })
})

router.use((req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/404.html', { root: dir })
})

export const routes = router