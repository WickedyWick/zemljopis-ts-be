import { Request, NextFunction, Response } from 'express'

export type Action<Params = {}, Body = {}, Query = {}, Locals = {}> = (req: Request<Params, any,  Body, Query, Locals>, res: Response, next: NextFunction) => any | void | Promise<void> | Promise<any>