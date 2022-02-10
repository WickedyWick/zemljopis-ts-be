import { validator } from 'validators/index'
import { check } from 'express-validator'
const roundTimeLimit:any = {
    '60': 1,
    '120': 2,
    '180': 3
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
        .matches('^[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,30}$')
        .bail(),
    check('roundTimeLimit')
        .escape()
        .bail()
        .exists({ checkFalsy: true })
        .bail()
        .custom(( value, { req }) => {
            console.log(value)
            if (roundTimeLimit[value] === undefined) throw new Error('Incorrect round time limit value!')
            return true
        }),
    check('playerCount')
        .escape()
        .bail()
        .exists({ checkFalsy: true })
        .bail()
        .isLength({ min: 1, max: 1})
        .bail()
        .custom(( value, { req }) => {
            if (playerCount[value] === undefined) throw new Error('Invalid number of players')
            return true
        })
        

])