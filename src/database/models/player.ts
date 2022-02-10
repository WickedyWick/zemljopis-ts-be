import { Model, BaseModel } from 'database/model'

export interface PlayerFields {
    id: number 
    room_code: string
    username: string
    session_token: string
    kicked: boolean
    created_at: Date | string
    updated_at: Date | string
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