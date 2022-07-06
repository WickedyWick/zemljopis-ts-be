import { Model, BaseModel, ModelDate } from 'database/model'

export interface RoundFields {
    id: number,
    room_code: string,
    letter: string,
    round_number: number,
    created_at: ModelDate,
    updated_at: ModelDate
}

export interface RoundMethods {
    createEmptyResults: (playerIds: number[]) => Promise<boolean>
 }

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
        async createEmptyResults(playerIds: number[]) {
            // Precreate empty results so less load on evaluation method and
            // its covering edge case where client disconnects and doesn't return data
            return true
        }
    }
}

export default new Round()