import { BaseModel, Model } from "database/model";

export interface ResultFields {
    id: number
    round_id: number
    player_id: number
    drzava: string
    points_dr: number
    grad: string
    points_gr: number
    ime: string
    points_im: number
    biljka: string
    points_bl: number
    zivotinja: string
    points_zv: number
    planina: string
    points_pl: number
    reka: string
    points_rk: number
    predmet: string
    points_pr: number
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
        'points_dr',
        'grad',
        'points_gr',
        'ime',
        'points_im',
        'biljka',
        'points_bl',
        'zivotinja',
        'points_zv',
        'planina',
        'points_pl',
        'reka',
        'points_rk',
        'predmet',
        'points_pr',
        'points',
    ]

    constructor () {
        super('result')
    }

    instanceMethods = {

    }
}

export default new Result()
