import { validator } from 'validators/index'
import { check } from 'express-validator'
const roundTimeLimit:any = {
    '60': 1,
    '90': 2,
    '120': 3,
    '180': 4
}

const playerCount: any = {
    '1': 1,
    '2': 2,
    '3': 1,
    '4': 2,
    '5': 1,
    '6': 2,
    '7': 1,
    '8': 2,
}
export const gameCreateValidator = validator([
    check('username')
        .escape()
        .bail()
        .exists({ checkFalsy: true})
        .bail()
        .isString()
        .bail()
        .isLength({ min: 4, max: 30 })
        .bail()
        .matches('^[A-Za-zа-ш0-9А-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,30}$','g')
        .bail()
    ,
    check('roundTimeLimit')
        .escape()
        .bail()
        .exists({ checkFalsy: true })
        .bail()
        .custom(( value, { req }) => {
            if (roundTimeLimit[value] === undefined) throw new Error('Incorrect round time limit value!')
            return true
        })
        .bail(),
    check('playerCount')
        .escape()
        .bail()
        .exists({ checkFalsy: true })
        .bail()
        .isLength({ min: 1, max: 2})
        .bail()
        .custom(( value, { req }) => {
            if (playerCount[value] === undefined) throw new Error('Invalid number of players')
            return true
        })
])

export const regUserValidator = validator([
    check('username')
        .escape()
        .bail()
        .exists({ checkFalsy: true})
        .bail()
        .isString()
        .bail()
        .isLength({ min: 4, max: 30 })
        .bail()
        .matches('^[A-Za-zа-ш0-9А-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,30}$','g')
        .bail(),
    check('roomCode')
        .escape()
        .bail()
        .exists({ checkFalsy: true })
        .bail()
        .isString()
        .bail()
        .isLength({ min: 8, max : 8 })
        .bail()
        .matches('^[A-Za-z0-9]{8}$','g')
        .bail()
])