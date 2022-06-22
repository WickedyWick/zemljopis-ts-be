import { Model, BaseModel, ModelDate } from 'database/model'

export interface PlayerFields {
    id: number 
    room_code: string
    username: string
    session_token: string
    kicked: boolean
    created_at: ModelDate
    updated_at: ModelDate
}

export interface PlayerMethods {

}

export type PlayerModel = Model<PlayerFields, PlayerMethods>

export class Player extends BaseModel<PlayerFields, PlayerMethods> {
    fields: [
        'id',
        'room_code',
        'username',
        'session_token',
        'kicked',
        'created_at',
        'updated_at'
    ]

    constructor () {
        super('player')
    }

    instanceMethods = {

    }
}

export default new Player()