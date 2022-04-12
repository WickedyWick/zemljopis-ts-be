import { Router } from 'express'
import { gameCreateValidator } from 'validators/homeValidator'
import { createRoom, regUser } from 'controllers/pageControllers/home.controller'
import { t } from 'controllers/pageControllers/t.controller'

const router = Router()
// add middleware
router.post('/createGame',gameCreateValidator, createRoom)
router.post('/regUser', regUser)
router.post('/test', t)

export const homeRouter = router