import { Router } from 'express'
import { gameCreateValidator } from 'validators/homeValidator'
import { createRoom, regUser } from 'controllers/pageControllers/home.controller'
import { test } from 'controllers/pageControllers/test'

const router = Router()
// add middleware
router.post('/createGame', createRoom)
router.post('/regUser', regUser)
router.post('/test', test)

export const homeRouter = router