import { action } from 'utils/action'
import { ValidationChain, validationResult } from 'express-validator'
import httpStatus from 'http-status'
import { Keyed } from 'utils/typings'
import { resourceLimits } from 'worker_threads'

export const validator = (rules: ValidationChain[]) => [
    ...rules,
    action((req, res, next) => {
        const errors = validationResult(req)

        if (errors.isEmpty()) return next()

        return res.status(httpStatus.BAD_REQUEST).json({
            errors: errors.array().reduce<Keyed<string>>((obj, err) => {
                obj[err.param] = err.msg
                return obj
            }, {})
        })
    })
]