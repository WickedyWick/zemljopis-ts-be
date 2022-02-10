import { Express } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
dotenv.config()
import morgan from 'morgan'


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

