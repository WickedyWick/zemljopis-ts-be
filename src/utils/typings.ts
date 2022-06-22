import { Request, NextFunction, Response } from 'express'

export type Action<Params = {}, Body = {}, Query = {}, Locals = {}> = (req: Request<Params, any,  Body, Query, Locals>, res: Response, next: NextFunction) => any | void | Promise<void> | Promise<any>

export type Keyed<DataType= any, IndexType = string> = IndexType extends string ? StringKeyedShape<DataType> : NumberKeyedShape<DataType>

export type StringKeyedShape<DataType> = {
    [index: string]: DataType
}

export type NumberKeyedShape<DataType> = {
    [index: number]: DataType
}

export type Maybe<G> = G | undefined
