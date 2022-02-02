import { Router } from 'express'
import httpStatus from 'http-status'
import { dir } from 'index'
const router = Router()

router.get('/ping', (req, res) => {
    res.status(httpStatus.OK).send('success')
})

router.use('/', (req,res) => {
    res.setHeader('Content-Type','text/html;charset=UTF-8')
    res.sendFile('./public/views/index.html', { root: dir })
})

router.use('/android', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/android.html', { root: dir })
})

router.use('/game', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/game.html', { root: dir })
})

router.use('/en', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/indexEn.html', { root: dir })
})

router.use('/upustvo', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/uputstvo.html', { root: dir })
})

router.use('/utisci', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/utisci.html', { root: dir })
})

router.use((req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/404.html', { root: dir })
})

export const routes = router