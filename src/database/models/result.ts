import { BaseModel, Model } from "database/model";

export interface ResultFields {
    id: number
    round_id: number
    player_id: number
    drzava: string
    grad: string
    ime: string
    biljka: string
    zivotinja: string
    planina: string
    reka: string
    predmet: string
    points: number
}

export interface ResultMethods {
}

export type ResultModel = Model<ResultFields, ResultMethods>

export class Result extends BaseModel<ResultFields, ResultMethods> {
    fields: [
        'id',
        'round_id',
        'player_id',
        'drzava',
        'grad',
        'ime',
        'biljka',
        'zivotinja',
        'planina',
        'reka',
        'predmet',
        'points',
    ]

    constructor () {
        super('result')
    }

    instanceMethods = {

    }
}

export default new Result()
