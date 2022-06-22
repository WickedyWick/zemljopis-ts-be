import { Action } from 'utils/typings'

export const action: <Params = {}, Body = {}, Query = {}, Locals = {}>(handler: Action<Params, Body, Query, Locals>) => Action<Params, Body, Query, Locals> = 
  (handler) => {
      return async (req, res, next) => {
          try { 
              return await handler(req, res, next)
          } catch(e) {
              next(e)
          }
      }
  }