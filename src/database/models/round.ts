import { Model, BaseModel, ModelDate } from 'database/model'
import { Result } from '.'

export interface RoundFields {
    id: number,
    room_code: string,
    letter: string,
    round_number: number,
    created_at: ModelDate,
    updated_at: ModelDate
}

export interface PlayerIdsInterface {
    [key: string]: string
}
export interface RoundMethods {
    createEmptyResults: (playerIds: PlayerIdsInterface) => Promise<boolean>
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
        async createEmptyResults(playerIds: PlayerIdsInterface) {
            // Precreate empty results so less load on evaluation method and
            // its covering edge case where client disconnects and doesn't return data
            for ( const [ key, value] of Object.entries(playerIds)) {
                //await db('round').insert({ round_id: this.id , player_id: value})
                console.log(this.id)
                const r = await Result.create({
                    round_id: this.id,
                    player_id: Number(value),
                }, true)
            }
            return true
        }
    }
}   

export default new Round()