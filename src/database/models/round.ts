import { Model, BaseModel, ModelDate } from 'database/model'

export interface RoundFields {
    id: number,
    room_code: string,
    letter: string,
    round_number: number,
    created_at: ModelDate,
    updated_at: ModelDate
}

export interface RoundMethods { }

export type RoundModel = Model<RoundFields, RoundMethods>

export class Round extends BaseModel<RoundFields, RoundMethods> {
    fields = [
        'id',
        'room_code',
        'letter',
        'round_number',
        'created_at',
        'updated_at'
    ]

    constructor () {
        super('round')
    }

    instanceMethods: RoundMethods = {

    }
}

export default new Round()