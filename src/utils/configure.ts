import { Express } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import morgan from 'morgan'

dotenv.config()

export const configure = (server: Express) => {
    server.use(cors())
    
    server.use(bodyParser.urlencoded({ extended: false }))

    if (!!process.env.LOG_LEVEL) {
        server.use(morgan(process.env.LOG_LEVEL))
    }

    server.use((req, res, next) => {
        /*
        if (!req.locals) {
          req.locals = {}
        }*/
        bodyParser.json()(req, res, next)
    })

}

