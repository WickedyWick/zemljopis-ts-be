import { Model, BaseModel, ModelDate } from 'database/model'

export interface RoomFields {
    id: number
    room_code: string
    player_count: number
    round_time_limit: number
    active: boolean
    created_at: ModelDate
    updated_at: ModelDate
}

export interface RoomMethods { 

}

export type RoomModel = Model<RoomFields, RoomMethods>

export class Room extends BaseModel<RoomFields, RoomMethods> {
    fields = [
        'id',
        'room_code',
        'player_count',
        'round_time_limit',
        'active',
        'created_at',
        'updated_at'
    ]

    constructor () {
        super('room')
    }

    instanceMethods: RoomMethods = {

    }
}

export default new Room()