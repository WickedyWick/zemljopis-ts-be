import { Model, BaseModel, ModelDate } from 'database/model'

export interface FieldDataFields {
    id: number
    data: string
    letter: string
    category: number
}

export interface FieldDataMethods {

}

export type FieldDataModel = Model<FieldDataFields, FieldDataMethods>

export class FieldData extends BaseModel<FieldDataFields, FieldDataMethods> {
    fields: [
        'id',
        'data',
        'letter',
        'category', 
    ]

    constructor () {
        super('field_data')
    }

    instanceMethods = {

    }
}

export default new FieldData()