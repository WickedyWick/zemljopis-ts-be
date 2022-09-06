import { Router } from 'express'
import httpStatus from 'http-status'
import { dir } from '../index'
import { homeRouter } from './home.router'
import { suggestionRouter } from './suggestion.router'

const router = Router()

router.use('/home', homeRouter)
router.use('/suggestion', suggestionRouter)
router.get('/ping', (req, res) => {
    res.status(httpStatus.OK).send('success')
})

router.get('/android', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/android.html', { root: dir })
})

router.get('/wordSheet', (req, res) => {
    res.setHeader('Content-Type', 'text/html; chartset=UTF-8')
    res.sendFile('./public/views/wordSheet.html', { root: dir })
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

router.get('/', (req,res) => {
    res.setHeader('Content-Type','text/html;charset=UTF-8')
    res.sendFile('./public/views/index.html', { root: dir })
})

router.use((req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/404.html', { root: dir })
})

export const routes = router