import { validator } from 'validators/index'
import { check } from 'express-validator'

export const generalSuggestionValidator = validator([
    check('suggestion')
    .isString()
    .isLength({ min: 1, max: 3600 })
])